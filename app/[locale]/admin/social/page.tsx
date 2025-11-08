"use client";

import { useTranslations } from "next-intl";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export default function SocialSettingsPage() {
  const t = useTranslations("admin");

  return (
    <AdminSettingsForm
      title={t("social.title")}
      subtitle={t("social.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("social.facebook")}
            </label>
            <input
              type="text"
              value={settings.social_facebook || ""}
              onChange={(e) =>
                updateSettings({ social_facebook: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("social.twitter")}
            </label>
            <input
              type="text"
              value={settings.social_twitter || ""}
              onChange={(e) =>
                updateSettings({ social_twitter: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("social.instagram")}
            </label>
            <input
              type="text"
              value={settings.social_instagram || ""}
              onChange={(e) =>
                updateSettings({ social_instagram: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://instagram.com/yourhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("social.linkedin")}
            </label>
            <input
              type="text"
              value={settings.social_linkedin || ""}
              onChange={(e) =>
                updateSettings({ social_linkedin: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("social.youtube")}
            </label>
            <input
              type="text"
              value={settings.social_youtube || ""}
              onChange={(e) =>
                updateSettings({ social_youtube: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://youtube.com/c/yourchannel"
            />
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
