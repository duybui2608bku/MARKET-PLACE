"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactSettingsPage() {
  const t = useT();

  return (
    <AdminSettingsForm
      title={t("admin.contact.title")}
      subtitle={t("admin.contact.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div className="space-y-2">
            <Label htmlFor="contact_email">
              {t("admin.contact.contactEmail")}
            </Label>
            <Input
              id="contact_email"
              type="email"
              value={settings.contact_email || ""}
              onChange={(e) =>
                updateSettings({ contact_email: e.target.value })
              }
              placeholder="contact@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">
              {t("admin.contact.contactPhone")}
            </Label>
            <Input
              id="contact_phone"
              type="tel"
              value={settings.contact_phone || ""}
              onChange={(e) =>
                updateSettings({ contact_phone: e.target.value })
              }
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_address">
              {t("admin.contact.contactAddress")}
            </Label>
            <Textarea
              id="contact_address"
              value={settings.contact_address || ""}
              onChange={(e) =>
                updateSettings({ contact_address: e.target.value })
              }
              rows={3}
              placeholder="123 Main St, City, Country"
            />
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
