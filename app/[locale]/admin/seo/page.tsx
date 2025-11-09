"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import ImageUpload from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SEOSettingsPage() {
  const t = useT();

  return (
    <AdminSettingsForm
      title={t("admin.seo.title")}
      subtitle={t("admin.seo.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div className="space-y-2">
            <Label htmlFor="site_title">
              {t("admin.seo.siteTitle")}
            </Label>
            <Input
              id="site_title"
              type="text"
              value={settings.site_title || ""}
              onChange={(e) => updateSettings({ site_title: e.target.value })}
              placeholder="MarketPlace"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">
              {t("admin.seo.siteDescription")}
            </Label>
            <Textarea
              id="site_description"
              value={settings.site_description || ""}
              onChange={(e) =>
                updateSettings({ site_description: e.target.value })
              }
              rows={3}
              placeholder="Connect workers with employers"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_keywords">
              {t("admin.seo.siteKeywords")}
            </Label>
            <Input
              id="site_keywords"
              type="text"
              value={settings.site_keywords || ""}
              onChange={(e) =>
                updateSettings({ site_keywords: e.target.value })
              }
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
