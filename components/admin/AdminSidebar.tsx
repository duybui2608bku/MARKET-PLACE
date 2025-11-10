"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT, useLocale } from "@/i18n/provider";
import {
  LayoutDashboard,
  Image,
  Mail,
  Settings,
  Users,
  Share2,
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  UserCog,
  Briefcase,
  Calendar,
  Flag,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

export default function AdminSidebar() {
  const t = useT();
  const pathname = usePathname();
  const locale = useLocale();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    settings: true, // Settings menu expanded by default
  });

  const menuItems: MenuItem[] = [
    {
      key: "dashboard",
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      href: `/${locale}/admin`,
    },
    {
      key: "userManagement",
      icon: <UserCog className="w-5 h-5 shrink-0" />,
      children: [
        {
          key: "workers",
          icon: <Briefcase className="w-4 h-4 shrink-0" />,
          href: `/${locale}/admin/workers`,
        },
        {
          key: "clients",
          icon: <Users className="w-4 h-4 shrink-0" />,
          href: `/${locale}/admin/clients`,
        },
      ],
    },
    {
      key: "bookings",
      icon: <Calendar className="w-5 h-5 shrink-0" />,
      href: `/${locale}/admin/bookings`,
    },
    {
      key: "reports",
      icon: <Flag className="w-5 h-5 shrink-0" />,
      href: `/${locale}/admin/reports`,
    },
    {
      key: "settings",
      icon: <Settings className="w-5 h-5 shrink-0" />,
      children: [
        {
          key: "seo",
          icon: <Settings className="w-4 h-4 shrink-0" />,
          href: `/${locale}/admin/seo`,
        },
        {
          key: "branding",
          icon: <Image className="w-4 h-4 shrink-0" />,
          href: `/${locale}/admin/branding`,
        },
        {
          key: "header",
          icon: <Settings className="w-4 h-4 shrink-0" />,
          href: `/${locale}/admin/header`,
        },
        {
          key: "footer",
          icon: <Settings className="w-4 h-4 shrink-0" />,
          href: `/${locale}/admin/footer`,
        },
        {
          key: "contact",
          icon: <Mail className="w-4 h-4 shrink-0" />,
          href: `/${locale}/admin/contact`,
        },
        {
          key: "social",
          icon: <Share2 className="w-4 h-4 shrink-0" />,
          href: `/${locale}/admin/social`,
        },
      ],
    },
    {
      key: "users",
      icon: <Users className="w-5 h-5 shrink-0" />,
      href: `/${locale}/admin/users`,
    },
  ];

  const toggleMenu = (key: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.href) {
      return isActive(item.href);
    }
    if (item.children) {
      return item.children.some((child) => child.href && isActive(child.href));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.key];
    const active = isMenuActive(item);

    if (hasChildren) {
      return (
        <li key={item.key}>
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              active
                ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm"
                : "text-foreground/70 hover:text-primary hover:bg-accent/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`transition-transform group-hover:scale-110 ${active ? "text-primary" : ""}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="font-medium text-sm">
                  {t(`admin.menu.${item.key}`)}
                </span>
              )}
            </div>
            {!isCollapsed &&
              (isExpanded ? (
                <ChevronDown className="w-4 h-4 shrink-0 transition-transform" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform" />
              ))}
          </button>

          {/* Submenu */}
          {isExpanded && !isCollapsed && (
            <ul className="mt-1.5 ml-4 space-y-1 border-l-2 border-accent pl-3">
              {item?.children?.map((child) => (
                <li key={child.key}>
                  <Link
                    href={child.href!}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group ${
                      isActive(child.href!)
                        ? "bg-primary/5 text-primary font-medium shadow-sm"
                        : "text-foreground/60 hover:text-primary hover:bg-accent/30 hover:pl-4"
                    }`}
                  >
                    <div className={`transition-all ${isActive(child.href!) ? "text-primary" : ""}`}>
                      {child.icon}
                    </div>
                    <span>{t(`admin.menu.${child.key}`)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.key}>
        <Link
          href={item.href!}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            active
              ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm font-medium"
              : "text-foreground/70 hover:text-primary hover:bg-accent/50 hover:shadow-sm"
          }`}
        >
          <div className={`transition-transform group-hover:scale-110 ${active ? "text-primary" : ""}`}>
            {item.icon}
          </div>
          {!isCollapsed && (
            <span className="font-medium text-sm">{t(`admin.menu.${item.key}`)}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-72"
        } min-h-screen bg-gradient-to-b from-white to-accent/30 dark:from-gray-900 dark:to-gray-800 border-r border-border/40 fixed left-0 top-0 transition-all duration-300 z-50 shadow-xl`}
      >
        {/* Logo/Brand with Toggle */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border/40 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          {!isCollapsed && (
            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Admin Panel
                </span>
                <span className="text-xs text-muted-foreground">Dashboard</span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2.5 rounded-xl hover:bg-accent transition-all duration-200 hover:scale-110 ${
              isCollapsed ? "mx-auto" : ""
            }`}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-primary" />
            ) : (
              <X className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 overflow-y-auto" style={{ height: "calc(100vh - 160px)" }}>
          <ul className="space-y-1.5">{menuItems.map(renderMenuItem)}</ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/40 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <Link
            href={`/${locale}`}
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3"
            } px-4 py-3 text-muted-foreground hover:text-primary transition-all duration-200 rounded-xl hover:bg-accent group`}
            title={isCollapsed ? t("admin.backToSite") : undefined}
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {!isCollapsed && (
              <span className="text-sm font-medium">{t("admin.backToSite")}</span>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
