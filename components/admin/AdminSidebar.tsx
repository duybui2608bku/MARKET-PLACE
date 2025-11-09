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
  ChevronDown,
  ChevronRight,
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
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
              active
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {!isCollapsed && (
                <span className="font-medium">
                  {t(`admin.menu.${item.key}`)}
                </span>
              )}
            </div>
            {!isCollapsed &&
              (isExpanded ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              ))}
          </button>

          {/* Submenu */}
          {isExpanded && !isCollapsed && (
            <ul className="mt-1 ml-4 space-y-1">
              {item.children.map((child) => (
                <li key={child.key}>
                  <Link
                    href={child.href!}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                      isActive(child.href!)
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {child.icon}
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
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            active
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {item.icon}
          {!isCollapsed && (
            <span className="font-medium">
              {t(`admin.menu.${item.key}`)}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 transition-all duration-300 z-50`}
    >
      {/* Logo/Brand with Toggle */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            isCollapsed ? "mx-auto" : ""
          }`}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-1">{menuItems.map(renderMenuItem)}</ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href={`/${locale}`}
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-2"
          } px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
          title={isCollapsed ? t("admin.backToSite") : undefined}
        >
          <Home className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm">{t("admin.backToSite")}</span>}
        </Link>
      </div>
    </aside>
  );
}
