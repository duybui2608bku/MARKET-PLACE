"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export default function HeaderSettingsPage() {
  const t = useT();

  return (
    <AdminSettingsForm
      title={t("admin.header.title")}
      subtitle={t("admin.header.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.header.headerBgColor")}
            </label>
            <input
              type="text"
              value={settings.header_bg_color || ""}
              onChange={(e) =>
                updateSettings({ header_bg_color: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="#ffffff"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.header.headerTextColor")}
            </label>
            <input
              type="text"
              value={settings.header_text_color || ""}
              onChange={(e) =>
                updateSettings({ header_text_color: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="#000000"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.show_language_switcher ?? true}
              onChange={(e) =>
                updateSettings({ show_language_switcher: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t("admin.header.showLanguageSwitcher")}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.show_theme_toggle ?? true}
              onChange={(e) =>
                updateSettings({ show_theme_toggle: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t("admin.header.showThemeToggle")}
            </label>
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
