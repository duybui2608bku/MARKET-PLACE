import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Whitelist allowed extensions for security
    const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPG, JPEG, PNG, GIF, and WebP are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Validate MIME type matches extension
    const mimeTypeMap: Record<string, string[]> = {
      jpg: ["image/jpeg"],
      jpeg: ["image/jpeg"],
      png: ["image/png"],
      gif: ["image/gif"],
      webp: ["image/webp"],
    };

    const expectedMimeTypes = mimeTypeMap[fileExt] || [];
    if (!expectedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "File type mismatch. The file extension does not match its content",
        },
        { status: 400 }
      );
    }

    // Generate unique filename with sanitized extension
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Delete old avatar if exists
    const { data: userData } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (userData?.avatar_url) {
      try {
        // Extract path from URL with validation
        const urlParts = userData.avatar_url.split("/avatars/");
        if (urlParts.length === 2) {
          const oldPath = urlParts[1];

          // Validate path doesn't contain traversal patterns
          if (
            oldPath &&
            !oldPath.includes("..") &&
            !oldPath.includes("//") &&
            oldPath.startsWith(`${userId}/`)
          ) {
            await supabase.storage.from("avatars").remove([oldPath]);
          } else {
            console.warn("Invalid avatar path detected, skipping deletion:", oldPath);
          }
        }
      } catch (error) {
        // Log but don't fail the upload if old avatar deletion fails
        console.error("Error deleting old avatar:", error);
      }
    }

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    // Update user's avatar_url in database
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("Unexpected error in upload-avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
