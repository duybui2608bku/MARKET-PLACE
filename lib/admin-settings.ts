import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";

export interface AdminSettings {
  id: string;
  // SEO Settings
  site_title?: string | null;
  site_description?: string | null;
  site_keywords?: string | null;
  og_image_url?: string | null;

  // Logo & Branding
  logo_url?: string | null;
  logo_text?: string | null;
  favicon_url?: string | null;

  // Header Settings
  header_bg_color?: string | null;
  header_text_color?: string | null;
  show_language_switcher?: boolean;
  show_theme_toggle?: boolean;

  // Footer Settings
  footer_enabled?: boolean;
  footer_text?: string | null;
  footer_bg_color?: string | null;
  footer_text_color?: string | null;

  // Contact Info
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_address?: string | null;

  // Social Media Links
  social_facebook?: string | null;
  social_twitter?: string | null;
  social_instagram?: string | null;
  social_linkedin?: string | null;
  social_youtube?: string | null;

  // Legal Links
  terms_url?: string | null;
  privacy_url?: string | null;
  about_url?: string | null;

  // Custom Footer Links
  custom_footer_links?: Array<{
    label: string;
    url: string;
    locale?: string;
  }>;

  // Metadata
  created_at?: string;
  updated_at?: string;
  updated_by?: string | null;
}

/**
 * Get admin settings (public - no auth required)
 * This version is for client-side use
 */
export async function getAdminSettings(): Promise<AdminSettings | null> {
  try {
    const response = await fetch("/api/admin/settings");
    if (!response.ok) {
      console.error("Error fetching admin settings:", response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return null;
  }
}

/**
 * Get admin settings server-side (for Next.js server components and API routes)
 */
export async function getAdminSettingsServer(): Promise<AdminSettings | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error("Supabase environment variables not found");
    return null;
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from("admin_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching admin settings:", error);
    return null;
  }

  return data;
}

/**
 * Update admin settings (requires admin auth)
 * This version is for server-side use (API routes)
 */
export async function updateAdminSettingsServer(
  settings: Partial<AdminSettings>,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use admin client to bypass RLS for checking user role
    const supabase = createAdminClient();

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || userData?.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Get the first (and only) settings record
    const { data: existingSettings } = await supabase
      .from("admin_settings")
      .select("id")
      .limit(1)
      .single();

    if (!existingSettings) {
      return { success: false, error: "Settings not found" };
    }

    // Update settings
    const { error: updateError } = await supabase
      .from("admin_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("id", existingSettings.id);

    if (updateError) {
      console.error("Error updating admin settings:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating admin settings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}

/**
 * Check if user is admin (server-side)
 */
export async function isUserAdminServer(userId: string): Promise<boolean> {
  try {
    // Use admin client to bypass RLS for checking user role
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) return false;

    return data.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
