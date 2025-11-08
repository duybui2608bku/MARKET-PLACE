-- Create admin_settings table to store site-wide configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- SEO Settings
  site_title VARCHAR(200),
  site_description TEXT,
  site_keywords TEXT,
  og_image_url TEXT,

  -- Logo & Branding
  logo_url TEXT,
  logo_text VARCHAR(100),
  favicon_url TEXT,

  -- Header Settings
  header_bg_color VARCHAR(50),
  header_text_color VARCHAR(50),
  show_language_switcher BOOLEAN DEFAULT true,
  show_theme_toggle BOOLEAN DEFAULT true,

  -- Footer Settings
  footer_enabled BOOLEAN DEFAULT true,
  footer_text TEXT,
  footer_bg_color VARCHAR(50),
  footer_text_color VARCHAR(50),

  -- Contact Info
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,

  -- Social Media Links
  social_facebook VARCHAR(255),
  social_twitter VARCHAR(255),
  social_instagram VARCHAR(255),
  social_linkedin VARCHAR(255),
  social_youtube VARCHAR(255),

  -- Legal Links
  terms_url TEXT,
  privacy_url TEXT,
  about_url TEXT,

  -- Custom Footer Links (JSON array)
  custom_footer_links JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_id ON public.admin_settings(id);

-- Insert default settings (only one row should exist)
INSERT INTO public.admin_settings (
  site_title,
  site_description,
  logo_text,
  footer_enabled,
  footer_text
) VALUES (
  'MarketPlace',
  'Connect workers with employers',
  'MarketPlace',
  true,
  '© 2025 MarketPlace. All rights reserved.'
) ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read settings
CREATE POLICY "Anyone can read admin settings"
  ON public.admin_settings
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users with admin role can update
-- Note: You'll need to add an 'is_admin' field to users table or check specific user IDs
CREATE POLICY "Only admins can update settings"
  ON public.admin_settings
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_admin_settings_timestamp
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Grant permissions
GRANT SELECT ON public.admin_settings TO anon, authenticated;
GRANT UPDATE ON public.admin_settings TO authenticated;
