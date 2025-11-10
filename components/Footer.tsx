"use client";

import Link from "next/link";
import { useT, useLocale } from "@/i18n/provider";
import { useEffect, useState } from "react";
import { AdminSettings } from "@/lib/admin-settings";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";

export default function Footer() {
  const t = useT();
  const locale = useLocale();
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  useEffect(() => {
    // Fetch admin settings
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((error) => console.error("Error fetching settings:", error));
  }, []);

  // Don't render if footer is disabled
  if (settings && settings.footer_enabled === false) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const footerText =
    settings?.footer_text ||
    `© ${currentYear} MarketPlace. All rights reserved.`;

  const socialLinks = [
    {
      name: "Facebook",
      url: settings?.social_facebook,
      icon: Facebook,
    },
    {
      name: "Twitter",
      url: settings?.social_twitter,
      icon: Twitter,
    },
    {
      name: "Instagram",
      url: settings?.social_instagram,
      icon: Instagram,
    },
    {
      name: "LinkedIn",
      url: settings?.social_linkedin,
      icon: Linkedin,
    },
    {
      name: "YouTube",
      url: settings?.social_youtube,
      icon: Youtube,
    },
  ];

  return (
    <footer
      className="border-t border-[#690F0F] bg-[#690F0F] mt-auto text-white"
      style={{
        backgroundColor: settings?.footer_bg_color || "#690F0F",
        color: settings?.footer_text_color || "#FFFFFF",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4 col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.logo_text || "Logo"}
                  className="h-8 w-auto"
                />
              ) : (
                <>
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <span className="text-[#690F0F] font-bold text-lg">M</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    {settings?.logo_text || "MarketPlace"}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-[#E4D6C9] max-w-xs">
              {settings?.site_description ||
                t("Footer.description", "Connect workers with employers")}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(
                (social) =>
                  social.url && (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-full border border-white/20 bg-white/10 hover:bg-white hover:text-[#690F0F] inline-flex items-center justify-center transition-colors"
                      aria-label={social.name}
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              {t("Footer.quickLinks", "Quick Links")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale || "vi"}`}
                  className="text-sm text-[#E4D6C9] hover:text-white transition-colors inline-block hover:underline"
                >
                  {t("Footer.home", "Home")}
                </Link>
              </li>
              <li>
                <Link
                  href={settings?.about_url || `/${locale || "vi"}/about`}
                  className="text-sm text-[#E4D6C9] hover:text-white transition-colors inline-block hover:underline"
                >
                  {t("Footer.about", "About Us")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale || "vi"}/register`}
                  className="text-sm text-[#E4D6C9] hover:text-white transition-colors inline-block hover:underline"
                >
                  {t("Footer.getStarted", "Get Started")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              {t("Footer.legal", "Legal")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={settings?.privacy_url || `/${locale || "vi"}/privacy`}
                  className="text-sm text-[#E4D6C9] hover:text-white transition-colors inline-block hover:underline"
                >
                  {t("Footer.privacy", "Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link
                  href={settings?.terms_url || `/${locale || "vi"}/terms`}
                  className="text-sm text-[#E4D6C9] hover:text-white transition-colors inline-block hover:underline"
                >
                  {t("Footer.terms", "Terms of Service")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              {t("Footer.contact", "Contact")}
            </h3>
            <ul className="space-y-3">
              {settings?.contact_email && (
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-[#E4D6C9] mt-0.5 flex-shrink-0" />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-sm text-[#E4D6C9] hover:text-white transition-colors hover:underline"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings?.contact_phone && (
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-[#E4D6C9] mt-0.5 flex-shrink-0" />
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="text-sm text-[#E4D6C9] hover:text-white transition-colors hover:underline"
                  >
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              {settings?.contact_address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#E4D6C9] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#E4D6C9]">
                    {settings.contact_address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Custom Footer Links */}
        {settings?.custom_footer_links &&
          settings.custom_footer_links.length > 0 && (
            <>
              <Separator className="my-8 bg-white/20" />
              <div className="flex flex-wrap gap-4 justify-center">
                {settings.custom_footer_links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    className="text-sm text-[#E4D6C9] hover:text-white transition-colors hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </>
          )}

        {/* Copyright */}
        <Separator className="my-8 bg-white/20" />
        <p className="text-center text-sm text-[#E4D6C9]">{footerText}</p>
      </div>
    </footer>
  );
}
