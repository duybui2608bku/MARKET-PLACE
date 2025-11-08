import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSettings,
  updateAdminSettings,
  isUserAdmin,
} from "@/lib/admin-settings";

/**
 * GET /api/admin/settings
 * Get current admin settings (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const settings = await getAdminSettings();

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
    // Check if user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update settings
    const result = await updateAdminSettings(body);

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
    // Check if user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update settings
    const result = await updateAdminSettings(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update settings" },
        { status: 400 }
      );
    }

    // Get updated settings
    const settings = await getAdminSettings();

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error in PATCH /api/admin/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
