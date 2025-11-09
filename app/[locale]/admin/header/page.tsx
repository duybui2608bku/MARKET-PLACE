"use client";

import { useT } from "@/i18n/provider";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function HeaderSettingsPage() {
  const t = useT();

  return (
    <AdminSettingsForm
      title={t("admin.header.title")}
      subtitle={t("admin.header.subtitle")}
    >
      {(settings, updateSettings) => (
        <>
          <div className="space-y-2">
            <Label htmlFor="header_bg_color">
              {t("admin.header.headerBgColor")}
            </Label>
            <Input
              id="header_bg_color"
              type="text"
              value={settings.header_bg_color || ""}
              onChange={(e) =>
                updateSettings({ header_bg_color: e.target.value })
              }
              placeholder="#ffffff"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="header_text_color">
              {t("admin.header.headerTextColor")}
            </Label>
            <Input
              id="header_text_color"
              type="text"
              value={settings.header_text_color || ""}
              onChange={(e) =>
                updateSettings({ header_text_color: e.target.value })
              }
              placeholder="#000000"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show_language_switcher"
              checked={settings.show_language_switcher ?? true}
              onCheckedChange={(checked) =>
                updateSettings({ show_language_switcher: !!checked })
              }
            />
            <Label htmlFor="show_language_switcher" className="font-normal cursor-pointer">
              {t("admin.header.showLanguageSwitcher")}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show_theme_toggle"
              checked={settings.show_theme_toggle ?? true}
              onCheckedChange={(checked) =>
                updateSettings({ show_theme_toggle: !!checked })
              }
            />
            <Label htmlFor="show_theme_toggle" className="font-normal cursor-pointer">
              {t("admin.header.showThemeToggle")}
            </Label>
          </div>
        </>
      )}
    </AdminSettingsForm>
  );
}
