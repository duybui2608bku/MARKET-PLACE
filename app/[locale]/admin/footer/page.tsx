"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function FooterSettingsPage() {
  const t = useT();

  return (
    <AdminSettingsForm
      title={t("admin.footer.title")}
      subtitle={t("admin.footer.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="footer_enabled"
              checked={settings.footer_enabled ?? true}
              onCheckedChange={(checked) =>
                updateSettings({ footer_enabled: !!checked })
              }
            />
            <Label htmlFor="footer_enabled" className="font-normal cursor-pointer">
              {t("admin.footer.enableFooter")}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_text">
              {t("admin.footer.footerText")}
            </Label>
            <Input
              id="footer_text"
              type="text"
              value={settings.footer_text || ""}
              onChange={(e) => updateSettings({ footer_text: e.target.value })}
              placeholder="© 2025 MarketPlace. All rights reserved."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_bg_color">
              {t("admin.footer.footerBgColor")}
            </Label>
            <Input
              id="footer_bg_color"
              type="text"
              value={settings.footer_bg_color || ""}
              onChange={(e) =>
                updateSettings({ footer_bg_color: e.target.value })
              }
              placeholder="#ffffff"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms_url">
              {t("admin.footer.termsUrl")}
            </Label>
            <Input
              id="terms_url"
              type="text"
              value={settings.terms_url || ""}
              onChange={(e) => updateSettings({ terms_url: e.target.value })}
              placeholder="/terms"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy_url">
              {t("admin.footer.privacyUrl")}
            </Label>
            <Input
              id="privacy_url"
              type="text"
              value={settings.privacy_url || ""}
              onChange={(e) => updateSettings({ privacy_url: e.target.value })}
              placeholder="/privacy"
            />
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
