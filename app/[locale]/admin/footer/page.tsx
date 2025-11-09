"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export default function FooterSettingsPage() {
  const t = useT();

  return (
    <AdminSettingsForm
      title={t("admin.footer.title")}
      subtitle={t("admin.footer.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.footer_enabled ?? true}
              onChange={(e) =>
                updateSettings({ footer_enabled: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t("admin.footer.enableFooter")}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.footer.footerText")}
            </label>
            <input
              type="text"
              value={settings.footer_text || ""}
              onChange={(e) => updateSettings({ footer_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="© 2025 MarketPlace. All rights reserved."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.footer.footerBgColor")}
            </label>
            <input
              type="text"
              value={settings.footer_bg_color || ""}
              onChange={(e) =>
                updateSettings({ footer_bg_color: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="#ffffff"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.footer.termsUrl")}
            </label>
            <input
              type="text"
              value={settings.terms_url || ""}
              onChange={(e) => updateSettings({ terms_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="/terms"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.footer.privacyUrl")}
            </label>
            <input
              type="text"
              value={settings.privacy_url || ""}
              onChange={(e) => updateSettings({ privacy_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="/privacy"
            />
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
