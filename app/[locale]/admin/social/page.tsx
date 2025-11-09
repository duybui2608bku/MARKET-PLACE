"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SocialSettingsPage() {
  const t = useT();

  return (
    <AdminSettingsForm
      title={t("admin.social.title")}
      subtitle={t("admin.social.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div className="space-y-2">
            <Label htmlFor="social_facebook">
              {t("admin.social.facebook")}
            </Label>
            <Input
              id="social_facebook"
              type="text"
              value={settings.social_facebook || ""}
              onChange={(e) =>
                updateSettings({ social_facebook: e.target.value })
              }
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_twitter">
              {t("admin.social.twitter")}
            </Label>
            <Input
              id="social_twitter"
              type="text"
              value={settings.social_twitter || ""}
              onChange={(e) =>
                updateSettings({ social_twitter: e.target.value })
              }
              placeholder="https://twitter.com/yourhandle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_instagram">
              {t("admin.social.instagram")}
            </Label>
            <Input
              id="social_instagram"
              type="text"
              value={settings.social_instagram || ""}
              onChange={(e) =>
                updateSettings({ social_instagram: e.target.value })
              }
              placeholder="https://instagram.com/yourhandle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_linkedin">
              {t("admin.social.linkedin")}
            </Label>
            <Input
              id="social_linkedin"
              type="text"
              value={settings.social_linkedin || ""}
              onChange={(e) =>
                updateSettings({ social_linkedin: e.target.value })
              }
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_youtube">
              {t("admin.social.youtube")}
            </Label>
            <Input
              id="social_youtube"
              type="text"
              value={settings.social_youtube || ""}
              onChange={(e) =>
                updateSettings({ social_youtube: e.target.value })
              }
              placeholder="https://youtube.com/c/yourchannel"
            />
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
