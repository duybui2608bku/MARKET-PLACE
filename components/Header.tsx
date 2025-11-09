"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useT, useLocale } from "@/i18n/provider";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUser, User } from "@/lib/users";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Moon,
  Sun,
  Globe,
  User as UserIcon,
  Settings,
  LogOut,
  Menu,
  ChevronDown
} from "lucide-react";

export default function Header() {
  const t = useT();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme =
      (savedTheme as "light" | "dark") || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  // Check authentication status
  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) {
        checkUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setShowUserMenu(false);
      router.push(`/${locale || "vi"}`);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  const toggleTheme = () => {
    if (!theme) return;
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const switchLocale = (newLocale: string) => {
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year

    // Extract current locale from pathname and replace with new locale
    // pathname format: /{locale}/path or /{locale}
    const segments = pathname.split("/").filter(Boolean);

    // First segment is the locale, remove it
    if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0] as any)) {
      segments.shift(); // remove locale
    }

    // Build new path with new locale
    const newPath = `/${newLocale}${
      segments.length > 0 ? "/" + segments.join("/") : ""
    }`;

    // Force a hard reload to the new locale path
    window.location.href = newPath;
  };

  const localeNames: Record<string, string> = {
    en: "English",
    vi: "Tiếng Việt",
    zh: "中文",
    ko: "한국어",
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left Side */}
          <Link
            href={`/${locale || "vi"}`}
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline-block">
              MarketPlace
            </span>
          </Link>

          {/* Right Side - Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={t("Header.toggleTheme", "Toggle theme")}
              suppressHydrationWarning
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Language Switcher */}
            <DropdownMenu open={showLangMenu} onOpenChange={setShowLangMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 rounded-full">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {locale?.toUpperCase() || "EN"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {SUPPORTED_LOCALES.map((loc) => (
                  <DropdownMenuItem
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    className={locale === loc ? "bg-accent" : ""}
                  >
                    {localeNames[loc]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Authentication Buttons */}
            {loading ? (
              // Loading placeholder
              <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              // User Menu (when logged in)
              <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 gap-2 rounded-full px-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar_url || ""}
                        alt={user.full_name || user.email}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.full_name?.[0]?.toUpperCase() ||
                          user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline-block text-sm font-medium">
                      {user.full_name || user.email.split("@")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="w-fit mt-1"
                      >
                        {user.role === "worker"
                          ? t("Header.worker", "Worker")
                          : user.role === "admin"
                          ? t("Header.admin", "Admin")
                          : t("Header.employer", "Employer")}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${locale || "vi"}/profile/${user.role}`}
                      className="cursor-pointer flex items-center"
                    >
                      <UserIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span>{t("Header.myProfile", "My Profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/${locale || "vi"}/admin`}
                        className="cursor-pointer text-primary flex items-center"
                      >
                        <Settings className="mr-2 h-4 w-4 shrink-0" />
                        <span>{t("Header.adminPanel", "Admin Panel")}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4 shrink-0" />
                    <span>{t("Header.logout", "Logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Sign In & Get Started buttons (when not logged in)
              <>
                <Button variant="ghost" size="sm" asChild className="rounded-full">
                  <Link href={`/${locale || "vi"}/login`}>
                    {t("Header.signIn", "Sign In")}
                  </Link>
                </Button>
                <Button size="sm" asChild className="rounded-full shadow-sm">
                  <Link href={`/${locale || "vi"}/register`}>
                    {t("Header.getStarted", "Get Started")}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={t("Header.toggleTheme", "Toggle theme")}
              suppressHydrationWarning
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 mt-8">
                  {/* User Section */}
                  {user && (
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={user.avatar_url || ""}
                          alt={user.full_name || user.email}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.full_name?.[0]?.toUpperCase() ||
                            user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">
                          {user.full_name || user.email.split("@")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Language Selector */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t("Header.language", "Language")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUPPORTED_LOCALES.map((loc) => (
                        <Button
                          key={loc}
                          variant={locale === loc ? "default" : "outline"}
                          size="sm"
                          onClick={() => switchLocale(loc)}
                          className="justify-start"
                        >
                          {localeNames[loc]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Menu Items */}
                  {user ? (
                    <div className="space-y-1 pt-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href={`/${locale || "vi"}/profile/${user.role}`} className="flex items-center">
                          <UserIcon className="mr-2 h-4 w-4 shrink-0" />
                          <span>{t("Header.myProfile", "My Profile")}</span>
                        </Link>
                      </Button>
                      {user.role === "admin" && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-primary"
                          asChild
                        >
                          <Link href={`/${locale || "vi"}/admin`} className="flex items-center">
                            <Settings className="mr-2 h-4 w-4 shrink-0" />
                            <span>{t("Header.adminPanel", "Admin Panel")}</span>
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4 shrink-0" />
                        <span>{t("Header.logout", "Logout")}</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/${locale || "vi"}/login`}>
                          {t("Header.signIn", "Sign In")}
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href={`/${locale || "vi"}/register`}>
                          {t("Header.getStarted", "Get Started")}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
