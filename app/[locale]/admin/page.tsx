"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@/i18n/provider";
import { AdminSettings } from "@/lib/admin-settings";
import { getCurrentUser, User } from "@/lib/users";

export default function AdminPage() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [settings, setSettings] = useState<Partial<AdminSettings>>({});
  const [activeTab, setActiveTab] = useState<
    "seo" | "branding" | "header" | "footer" | "contact" | "social"
  >("seo");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSettings();
    }
  }, [user]);

  async function checkAuth() {
    try {
      const userData = await getCurrentUser();
      setUser(userData);

      if (userData?.role !== "admin") {
        router.push(`/${locale || "vi"}`);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push(`/${locale || "vi"}/login`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSettings() {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: t("Admin.saveSuccess", "Settings saved successfully!"),
        });
        setSettings(result.data);
      } else {
        setMessage({
          type: "error",
          text: result.error || t("Admin.saveError", "Failed to save settings"),
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({
        type: "error",
        text: t("Admin.saveError", "Failed to save settings"),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const tabs = [
    { id: "seo", label: t("Admin.seoTab", "SEO Settings") },
    { id: "branding", label: t("Admin.brandingTab", "Logo & Branding") },
    { id: "header", label: t("Admin.headerTab", "Header") },
    { id: "footer", label: t("Admin.footerTab", "Footer") },
    { id: "contact", label: t("Admin.contactTab", "Contact Info") },
    { id: "social", label: t("Admin.socialTab", "Social Media") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("Admin.title", "Admin Panel")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t(
              "Admin.subtitle",
              "Manage your website settings, SEO, branding, and more"
            )}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* SEO Tab */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Admin.seoSettings", "SEO Settings")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.siteTitle", "Site Title")}
                    </label>
                    <input
                      type="text"
                      value={settings.site_title || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, site_title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="MarketPlace"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.siteDescription", "Site Description")}
                    </label>
                    <textarea
                      value={settings.site_description || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          site_description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Connect workers with employers"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.siteKeywords", "Site Keywords (comma separated)")}
                    </label>
                    <input
                      type="text"
                      value={settings.site_keywords || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          site_keywords: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="marketplace, workers, jobs, hiring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.ogImage", "OG Image URL")}
                    </label>
                    <input
                      type="text"
                      value={settings.og_image_url || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, og_image_url: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/og-image.jpg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === "branding" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Admin.brandingSettings", "Logo & Branding")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.logoUrl", "Logo URL")}
                    </label>
                    <input
                      type="text"
                      value={settings.logo_url || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, logo_url: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.logoText", "Logo Text")}
                    </label>
                    <input
                      type="text"
                      value={settings.logo_text || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, logo_text: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="MarketPlace"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.faviconUrl", "Favicon URL")}
                    </label>
                    <input
                      type="text"
                      value={settings.favicon_url || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, favicon_url: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Header Tab */}
            {activeTab === "header" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Admin.headerSettings", "Header Settings")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.headerBgColor", "Header Background Color")}
                    </label>
                    <input
                      type="text"
                      value={settings.header_bg_color || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          header_bg_color: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="#ffffff"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.headerTextColor", "Header Text Color")}
                    </label>
                    <input
                      type="text"
                      value={settings.header_text_color || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          header_text_color: e.target.value,
                        })
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
                        setSettings({
                          ...settings,
                          show_language_switcher: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t("Admin.showLanguageSwitcher", "Show Language Switcher")}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.show_theme_toggle ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          show_theme_toggle: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t("Admin.showThemeToggle", "Show Theme Toggle")}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Tab */}
            {activeTab === "footer" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Admin.footerSettings", "Footer Settings")}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.footer_enabled ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          footer_enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t("Admin.enableFooter", "Enable Footer")}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.footerText", "Footer Copyright Text")}
                    </label>
                    <input
                      type="text"
                      value={settings.footer_text || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, footer_text: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="© 2025 MarketPlace. All rights reserved."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.footerBgColor", "Footer Background Color")}
                    </label>
                    <input
                      type="text"
                      value={settings.footer_bg_color || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          footer_bg_color: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="#ffffff"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.termsUrl", "Terms of Service URL")}
                    </label>
                    <input
                      type="text"
                      value={settings.terms_url || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, terms_url: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="/terms"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.privacyUrl", "Privacy Policy URL")}
                    </label>
                    <input
                      type="text"
                      value={settings.privacy_url || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, privacy_url: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="/privacy"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Admin.contactSettings", "Contact Information")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.contactEmail", "Contact Email")}
                    </label>
                    <input
                      type="email"
                      value={settings.contact_email || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact_email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.contactPhone", "Contact Phone")}
                    </label>
                    <input
                      type="tel"
                      value={settings.contact_phone || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact_phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("Admin.contactAddress", "Contact Address")}
                    </label>
                    <textarea
                      value={settings.contact_address || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact_address: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === "social" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Admin.socialSettings", "Social Media Links")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={settings.social_facebook || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          social_facebook: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={settings.social_twitter || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          social_twitter: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={settings.social_instagram || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          social_instagram: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={settings.social_linkedin || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          social_linkedin: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      YouTube
                    </label>
                    <input
                      type="text"
                      value={settings.social_youtube || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          social_youtube: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://youtube.com/c/yourchannel"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("Admin.cancel", "Cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {t("Admin.saveChanges", "Save Changes")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
