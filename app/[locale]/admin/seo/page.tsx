"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import ImageUpload from "@/components/admin/ImageUpload";

export default function SEOSettingsPage() {
  const t = useT();

  return (
    <AdminSettingsForm
      title={t("admin.seo.title")}
      subtitle={t("admin.seo.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.seo.siteTitle")}
            </label>
            <input
              type="text"
              value={settings.site_title || ""}
              onChange={(e) => updateSettings({ site_title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="MarketPlace"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.seo.siteDescription")}
            </label>
            <textarea
              value={settings.site_description || ""}
              onChange={(e) =>
                updateSettings({ site_description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Connect workers with employers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.seo.siteKeywords")}
            </label>
            <input
              type="text"
              value={settings.site_keywords || ""}
              onChange={(e) =>
                updateSettings({ site_keywords: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="marketplace, workers, jobs, hiring"
            />
          </div>

          <div>
            <ImageUpload
              label={t("admin.seo.ogImage")}
              value={settings.og_image_url || ""}
              onChange={(url) => updateSettings({ og_image_url: url })}
              helpText={t("admin.seo.uploadOgImage")}
            />
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
