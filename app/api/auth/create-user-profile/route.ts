import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * API Route: Create User Profile
 * 
 * Mục đích: Tạo user record trong bảng public.users sau khi đăng ký
 * Note: Trigger sẽ tự động tạo, API này là backup nếu cần
 */

export async function POST(req: NextRequest) {
  try {
    // 1. Lấy thông tin từ request
    const body = await req.json();
    const { userId, email, role, phone, preferred_language } = body;

    // 2. Validate required fields
    if (!userId || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields: userId, email, role" },
        { status: 400 }
      );
    }

    // 3. Validate role
    if (!["worker", "employer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'worker' or 'employer'" },
        { status: 400 }
      );
    }

    // 4. Sử dụng Admin client để insert (bypass RLS)
    const supabaseAdmin = createAdminClient();

    // 5. Check nếu user đã tồn tại
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingUser) {
      // User đã tồn tại, update thông tin
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          email,
          role,
          phone: phone || null,
          preferred_language: preferred_language || "vi",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating user:", updateError);
        return NextResponse.json(
          { error: "Failed to update user profile", details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "User profile updated successfully",
        user: updatedUser,
      });
    }

    // 6. Insert user mới
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        email,
        role,
        phone: phone || null,
        preferred_language: preferred_language || "vi",
        full_name: email, // Tạm thời dùng email làm tên
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating user:", insertError);
      return NextResponse.json(
        { error: "Failed to create user profile", details: insertError.message },
        { status: 500 }
      );
    }

    // 7. Return success
    return NextResponse.json({
      success: true,
      message: "User profile created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Unexpected error in create-user-profile:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint: Check if user profile exists
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // User not found
        return NextResponse.json({
          exists: false,
          user: null,
        });
      }

      return NextResponse.json(
        { error: "Failed to fetch user", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exists: true,
      user,
    });
  } catch (error) {
    console.error("Error in GET /api/auth/create-user-profile:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

