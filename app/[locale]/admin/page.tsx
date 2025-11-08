"use client";

import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Search,
  Image,
  Mail,
  FileText,
  Share2,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "vi";

  const stats = [
    {
      name: t("dashboard.totalUsers"),
      value: "0",
      icon: Users,
      color: "blue",
    },
    {
      name: t("dashboard.totalSettings"),
      value: "6",
      icon: LayoutDashboard,
      color: "green",
    },
    {
      name: t("dashboard.activeFeatures"),
      value: "8",
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const quickLinks = [
    {
      name: t("menu.seo"),
      description: t("seo.subtitle"),
      href: `/${locale}/admin/seo`,
      icon: Search,
      color: "blue",
    },
    {
      name: t("menu.branding"),
      description: t("branding.subtitle"),
      href: `/${locale}/admin/branding`,
      icon: Image,
      color: "purple",
    },
    {
      name: t("menu.header"),
      description: t("header.subtitle"),
      href: `/${locale}/admin/header`,
      icon: LayoutDashboard,
      color: "green",
    },
    {
      name: t("menu.footer"),
      description: t("footer.subtitle"),
      href: `/${locale}/admin/footer`,
      icon: FileText,
      color: "yellow",
    },
    {
      name: t("menu.contact"),
      description: t("contact.subtitle"),
      href: `/${locale}/admin/contact`,
      icon: Mail,
      color: "red",
    },
    {
      name: t("menu.social"),
      description: t("social.subtitle"),
      href: `/${locale}/admin/social`,
      icon: Share2,
      color: "pink",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.title")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-2">{t("dashboard.welcome")}</h2>
        <p className="text-blue-100">{t("subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg`}
              >
                <stat.icon
                  className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t("dashboard.quickLinks")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 bg-${link.color}-100 dark:bg-${link.color}-900/20 rounded-lg group-hover:scale-110 transition-transform`}
                >
                  <link.icon
                    className={`w-6 h-6 text-${link.color}-600 dark:text-${link.color}-400`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {link.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {link.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
