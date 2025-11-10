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
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              {t("admin.seo.siteTitle")}
            </label>
            <input
              type="text"
              value={settings.site_title || ""}
              onChange={(e) => updateSettings({ site_title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-border hover:border-primary/30 focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 dark:bg-gray-800/50 bg-white transition-all duration-200 text-foreground placeholder:text-muted-foreground"
              placeholder="MarketPlace"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              {t("admin.seo.siteDescription")}
            </label>
            <textarea
              value={settings.site_description || ""}
              onChange={(e) =>
                updateSettings({ site_description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border-2 border-border hover:border-primary/30 focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 dark:bg-gray-800/50 bg-white transition-all duration-200 text-foreground placeholder:text-muted-foreground resize-none"
              placeholder="Connect workers with employers"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              {t("admin.seo.siteKeywords")}
            </label>
            <input
              type="text"
              value={settings.site_keywords || ""}
              onChange={(e) =>
                updateSettings({ site_keywords: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-border hover:border-primary/30 focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 dark:bg-gray-800/50 bg-white transition-all duration-200 text-foreground placeholder:text-muted-foreground"
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
