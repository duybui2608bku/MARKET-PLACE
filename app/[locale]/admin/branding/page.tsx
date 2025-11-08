"use client";

import { useTranslations } from "next-intl";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import ImageUpload from "@/components/admin/ImageUpload";

export default function BrandingSettingsPage() {
  const t = useTranslations("admin");

  return (
    <AdminSettingsForm
      title={t("branding.title")}
      subtitle={t("branding.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div>
            <ImageUpload
              label={t("branding.logoUrl")}
              value={settings.logo_url || ""}
              onChange={(url) => updateSettings({ logo_url: url })}
              helpText={t("branding.uploadLogo")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("branding.logoText")}
            </label>
            <input
              type="text"
              value={settings.logo_text || ""}
              onChange={(e) =>
                updateSettings({ logo_text: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="MarketPlace"
            />
          </div>

          <div>
            <ImageUpload
              label={t("branding.faviconUrl")}
              value={settings.favicon_url || ""}
              onChange={(url) => updateSettings({ favicon_url: url })}
              helpText={t("branding.uploadFavicon")}
            />
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
