"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import ImageUpload from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

          <div className="space-y-2">
            <Label htmlFor="logo_text">
              {t("admin.branding.logoText")}
            </Label>
            <Input
              id="logo_text"
              type="text"
              value={settings.logo_text || ""}
              onChange={(e) =>
                updateSettings({ logo_text: e.target.value })
              }
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
