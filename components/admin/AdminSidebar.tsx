"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Search,
  FileText,
  Image,
  Mail,
  Settings,
  Users,
  Share2,
  Home,
} from "lucide-react";

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  href: string;
}

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  // Extract locale from pathname
  const locale = pathname.split("/")[1] || "vi";

  const menuItems: MenuItem[] = [
    {
      key: "dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: `/${locale}/admin`,
    },
    {
      key: "seo",
      icon: <Search className="w-5 h-5" />,
      href: `/${locale}/admin/seo`,
    },
    {
      key: "branding",
      icon: <Image className="w-5 h-5" />,
      href: `/${locale}/admin/branding`,
    },
    {
      key: "header",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: `/${locale}/admin/header`,
    },
    {
      key: "footer",
      icon: <FileText className="w-5 h-5" />,
      href: `/${locale}/admin/footer`,
    },
    {
      key: "contact",
      icon: <Mail className="w-5 h-5" />,
      href: `/${locale}/admin/contact`,
    },
    {
      key: "social",
      icon: <Share2 className="w-5 h-5" />,
      href: `/${locale}/admin/social`,
    },
    {
      key: "users",
      icon: <Users className="w-5 h-5" />,
      href: `/${locale}/admin/users`,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.icon}
                <span className="font-medium">
                  {t(`menu.${item.key}`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm">{t("backToSite")}</span>
        </Link>
      </div>
    </aside>
  );
}
