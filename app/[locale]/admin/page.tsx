"use client";

import { useT, useLocale } from "@/i18n/provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Users, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const t = useT();
  const locale = useLocale();

  const stats = [
    {
      name: t("admin.dashboard.totalUsers"),
      value: "0",
      icon: Users,
      bgColor: "bg-primary/10",
      textColor: "text-primary",
    },
    {
      name: t("admin.dashboard.totalSettings"),
      value: "6",
      icon: LayoutDashboard,
      bgColor: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      name: t("admin.dashboard.activeFeatures"),
      value: "8",
      icon: TrendingUp,
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  const quickLinks = [
    {
      name: t("admin.menu.settings"),
      description:
        "Manage SEO, branding, header, footer, contact & social media",
      href: `/${locale}/admin/seo`,
      icon: LayoutDashboard,
      bgColor: "bg-primary/10",
      textColor: "text-primary",
    },
    {
      name: t("admin.menu.users"),
      description: "Manage platform users and permissions",
      href: `/${locale}/admin/users`,
      icon: Users,
      bgColor: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.dashboard.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("admin.dashboard.subtitle")}
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary via-primary/90 to-purple-600 border-none shadow-airbnb">
        <CardHeader className="text-primary-foreground">
          <CardTitle className="text-2xl">
            {t("admin.dashboard.welcome")}
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {t("admin.subtitle")}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="shadow-airbnb">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          {t("admin.dashboard.quickLinks")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="shadow-airbnb hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${link.bgColor} group-hover:scale-110 transition-transform`}>
                      <link.icon className={`w-6 h-6 ${link.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center justify-between">
                        {link.name}
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        {link.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
