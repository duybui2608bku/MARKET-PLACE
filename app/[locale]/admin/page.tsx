"use client";

import { useT, useLocale } from "@/i18n/provider";
import { LayoutDashboard, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const t = useT();
  const locale = useLocale();

  const stats = [
    {
      name: t("admin.dashboard.totalUsers"),
      value: "0",
      icon: Users,
      color: "blue",
    },
    {
      name: t("admin.dashboard.totalSettings"),
      value: "6",
      icon: LayoutDashboard,
      color: "green",
    },
    {
      name: t("admin.dashboard.activeFeatures"),
      value: "8",
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const quickLinks = [
    {
      name: t("admin.menu.settings"),
      description:
        "Manage SEO, branding, header, footer, contact & social media",
      href: `/${locale}/admin/seo`,
      icon: LayoutDashboard,
      color: "blue",
    },
    {
      name: t("admin.menu.users"),
      description: "Manage platform users and permissions",
      href: `/${locale}/admin/users`,
      icon: Users,
      color: "green",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("admin.dashboard.title")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("admin.dashboard.subtitle")}
        </p>
      </div>

      {/* Welcome Card */}
      <div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-2">
          {t("admin.dashboard.welcome")}
        </h2>
        <p className="text-blue-100">{t("admin.subtitle")}</p>
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
          {t("admin.dashboard.quickLinks")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
