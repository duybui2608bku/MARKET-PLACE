import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSettingsServer,
  updateAdminSettingsServer,
  isUserAdminServer,
} from "@/lib/admin-settings";
import { getAuthenticatedUser } from "@/lib/supabase/auth-helpers";

/**
 * GET /api/admin/settings
 * Get current admin settings (public endpoint)
 */
export async function GET() {
  try {
    const settings = await getAdminSettingsServer();

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error in GET /api/admin/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Update admin settings (requires admin authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await isUserAdminServer(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update settings
    const result = await updateAdminSettingsServer(body, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update settings" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/admin/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/settings
 * Partial update of admin settings (requires admin authentication)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await isUserAdminServer(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update settings
    const result = await updateAdminSettingsServer(body, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update settings" },
        { status: 400 }
      );
    }

    // Get updated settings
    const settings = await getAdminSettingsServer();

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error in PATCH /api/admin/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
