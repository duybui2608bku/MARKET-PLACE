import { getSupabaseClient } from "./supabase/client";
import { createClient } from "@supabase/supabase-js";

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
 */
export async function getAdminSettings(): Promise<AdminSettings | null> {
  const supabase = getSupabaseClient();

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
 * Get admin settings server-side (for Next.js server components)
 */
export async function getAdminSettingsServer(): Promise<AdminSettings | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase environment variables not found");
    return null;
  }

  const supabase = createClient(
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
 */
export async function updateAdminSettings(
  settings: Partial<AdminSettings>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if user is admin
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
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
      updated_by: user.id,
    })
    .eq("id", existingSettings.id);

  if (updateError) {
    console.error("Error updating admin settings:", updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

/**
 * Check if current user is admin
 */
export async function isUserAdmin(): Promise<boolean> {
  const supabase = getSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data) return false;

  return data.role === "admin";
}
