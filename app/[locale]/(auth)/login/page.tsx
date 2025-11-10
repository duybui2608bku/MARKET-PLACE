"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useT, useLocale } from "@/i18n/provider";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, CheckCircle2, Home } from "lucide-react";

export default function LoginPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
      }
    };
    checkAuth();
  }, [supabase]);

  // If already logged in, show message instead of form
  if (isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Bạn đã đăng nhập rồi</CardTitle>
            <CardDescription>
              Bạn đang trong phiên đăng nhập. Vui lòng đăng xuất nếu muốn đăng nhập tài khoản khác.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full" size="lg">
              <Link href={`/${locale}`} className="flex items-center justify-center">
                <Home className="mr-2 h-4 w-4 shrink-0" />
                <span>Về trang chủ</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast.error(t("Auth.loginError"), signInError.message);
        setLoading(false);
        return;
      }

      toast.success(t("Auth.loginSuccess"), t("Auth.redirecting"));
      
      // Redirect to home page after successful login
      router.push(`/${locale}`);
    } catch {
      toast.error(t("Auth.loginError"), t("Auth.unknownError"));
      setLoading(false);
    }
  }

  // Google OAuth đã bị XÓA khỏi trang login
  // Lý do: Login không có role selection, nên không thể dùng OAuth
  // User cần đăng ký qua /register (có chọn role) nếu muốn dùng Google

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {t("Auth.loginTitle")}
              </CardTitle>
              <CardDescription className="mt-2">
                {t("Auth.loginSubtitle")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("Auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("Auth.password")}</Label>
                  <Link
                    href={`/${locale}/forgot-password`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t("Auth.forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11"
                size="lg"
              >
                {loading ? t("Auth.processing") : t("Auth.loginButton")}
              </Button>
            </form>

            {/* Info: Google OAuth removed from login page */}
            <Alert>
              <AlertDescription className="text-xs text-center">
                💡 {t("Auth.googleSignupOnly")}
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              {t("Auth.noAccount")}{" "}
              <Link
                href={`/${locale}/register`}
                className="font-medium text-foreground hover:underline"
              >
                {t("Auth.signUp")}
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t("Auth.needHelp")}{" "}
            <Link
              href={`/${locale}/support`}
              className="font-medium text-foreground hover:underline"
            >
              {t("Auth.contactSupport")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
