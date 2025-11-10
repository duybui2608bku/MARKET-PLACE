"use client";

import { useState, useEffect, ReactNode } from "react";
import { useT } from "@/i18n/provider";
import { toast } from "@/lib/toast";
import { AdminSettings } from "@/lib/admin-settings";
import { useRouter } from "next/navigation";

interface AdminSettingsFormProps {
  title: string;
  subtitle: string;
  children: (settings: Partial<AdminSettings>, updateSettings: (updates: Partial<AdminSettings>) => void) => ReactNode;
}

export default function AdminSettingsForm({
  title,
  subtitle,
  children,
}: AdminSettingsFormProps) {
  const t = useT();
  const router = useRouter();

  const [settings, setSettings] = useState<Partial<AdminSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t("admin.saveSuccess"), t("admin.settingsUpdated") || "Settings have been updated successfully");
        setSettings(result.data);
      } else {
        toast.error(t("admin.saveError"), result.error || t("admin.saveFailed"));
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("admin.saveError"), t("admin.networkError") || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function updateSettings(updates: Partial<AdminSettings>) {
    setSettings({ ...settings, ...updates });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg">{subtitle}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-br from-white to-accent/20 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-border/40 shadow-xl overflow-hidden">
        <div className="p-8 space-y-8">
          {children(settings, updateSettings)}
        </div>

        {/* Actions */}
        <div className="px-8 py-6 bg-accent/30 dark:bg-gray-800/50 border-t border-border/40 flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-border hover:border-primary/50 text-foreground hover:text-primary rounded-xl hover:bg-accent/50 transition-all duration-200 font-medium"
          >
            {t("admin.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 font-medium"
          >
            {saving && (
              <svg
                className="animate-spin h-5 w-5"
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
            {saving ? t("admin.saving") : t("admin.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
