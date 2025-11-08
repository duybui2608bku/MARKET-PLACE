"use client";

import { useTranslations } from "next-intl";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export default function ContactSettingsPage() {
  const t = useTranslations("admin");

  return (
    <AdminSettingsForm
      title={t("contact.title")}
      subtitle={t("contact.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("contact.contactEmail")}
            </label>
            <input
              type="email"
              value={settings.contact_email || ""}
              onChange={(e) =>
                updateSettings({ contact_email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("contact.contactPhone")}
            </label>
            <input
              type="tel"
              value={settings.contact_phone || ""}
              onChange={(e) =>
                updateSettings({ contact_phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("contact.contactAddress")}
            </label>
            <textarea
              value={settings.contact_address || ""}
              onChange={(e) =>
                updateSettings({ contact_address: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="123 Main St, City, Country"
            />
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
