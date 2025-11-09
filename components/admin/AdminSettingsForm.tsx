"use client";

import { useState, useEffect, ReactNode } from "react";
import { useT } from "@/i18n/provider";
import { AdminSettings } from "@/lib/admin-settings";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Save, X } from "lucide-react";

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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
          text: t("admin.saveSuccess"),
        });
        setSettings(result.data);
      } else {
        setMessage({
          type: "error",
          text: result.error || t("admin.saveError"),
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({
        type: "error",
        text: t("admin.saveError"),
      });
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>

      {/* Message */}
      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={message.type === "success" ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200" : ""}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card className="shadow-airbnb">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {children(settings, updateSettings)}
          </div>
        </CardContent>

        {/* Actions */}
        <CardFooter className="bg-muted/30 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            {t("admin.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("admin.saveChanges")}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
