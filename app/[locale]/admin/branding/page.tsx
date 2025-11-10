"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import ImageUpload from "@/components/admin/ImageUpload";

export default function BrandingSettingsPage() {
  const t = useT();

  return (
    <AdminSettingsForm
      title={t("admin.branding.title")}
      subtitle={t("admin.branding.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div>
            <ImageUpload
              label={t("admin.branding.logoUrl")}
              value={settings.logo_url || ""}
              onChange={(url) => updateSettings({ logo_url: url })}
              helpText={t("admin.branding.uploadLogo")}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              {t("admin.branding.logoText")}
            </label>
            <input
              type="text"
              value={settings.logo_text || ""}
              onChange={(e) =>
                updateSettings({ logo_text: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-border hover:border-primary/30 focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 dark:bg-gray-800/50 bg-white transition-all duration-200 text-foreground placeholder:text-muted-foreground"
              placeholder="MarketPlace"
            />
          </div>

          <div>
            <ImageUpload
              label={t("admin.branding.faviconUrl")}
              value={settings.favicon_url || ""}
              onChange={(url) => updateSettings({ favicon_url: url })}
              helpText={t("admin.branding.uploadFavicon")}
            />
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
