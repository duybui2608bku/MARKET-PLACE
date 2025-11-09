"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useT, useLocale } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  Check
} from "lucide-react";

type UserRole = "worker" | "employer" | null;

export default function RegisterPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const [step, setStep] = useState<"role" | "details">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
              Bạn không thể đăng ký tài khoản mới khi đang đăng nhập.
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

  async function handleEmailRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedRole) {
      setError(t("Auth.selectRoleError"));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // 1. Đăng ký user với Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: selectedRole,
            phone: phone || null,
            preferred_language: locale,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        // 2. Trigger sẽ tự động tạo user record trong public.users
        // Nhưng để đảm bảo, ta gọi API backup
        let profileCreated = false;

        try {
          const response = await fetch("/api/auth/create-user-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
              role: selectedRole,
              phone: phone || null,
              preferred_language: locale,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.warn("Profile creation API failed:", result.error);
            // Don't fail registration, but warn user
          } else {
            profileCreated = true;
          }
        } catch (apiError) {
          console.error("Profile creation request failed:", apiError);
          // Don't fail registration, trigger should handle it
        }

        // Show appropriate success message
        if (profileCreated) {
          setMessage(t("Auth.signupSuccess"));
        } else {
          setMessage(
            t("Auth.signupSuccessWithNote") ||
              "Account created! Please check your email to verify your account."
          );
        }

        // Redirect workers to onboarding
        if (selectedRole === "worker") {
          setTimeout(() => {
            router.push(`/${locale}/worker-onboarding`);
          }, 2000);
        }
      } else {
        setMessage(t("Auth.signupSuccess"));
      }

      setEmail("");
      setPassword("");
      setPhone("");
    } catch (err) {
      console.error("Registration error:", err);
      setError(t("Auth.unknownError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!selectedRole) {
      setError(t("Auth.selectRoleError"));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/${locale}/auth-callback?role=${selectedRole}`
          : undefined;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            role: selectedRole,
          },
        },
      });

      if (oauthError) {
        console.error("OAuth error:", oauthError);
        setError(oauthError.message);
      }
    } catch (err) {
      console.error("Google OAuth failed:", err);
      setError(t("Auth.oauthError"));
    } finally {
      setLoading(false);
    }
  }

  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role);
    setStep("details");
    setError(null);
  }

  function handleBackToRoleSelection() {
    setStep("role");
    setError(null);
    setMessage(null);
  }

  if (step === "role") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {t("Auth.title")}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              {t("Auth.selectAccountType")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Worker Card */}
            <button
              onClick={() => handleRoleSelect("worker")}
              className="group relative overflow-hidden rounded-2xl border-2 border-black/10 dark:border-white/15 bg-white dark:bg-zinc-950 p-8 text-left transition-all hover:border-black/30 dark:hover:border-white/30 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-full blur-3xl -z-0" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  {t("Auth.workerAccount")}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  {t("Auth.workerDescription")}
                </p>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("Auth.workerFeature1")}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("Auth.workerFeature2")}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("Auth.workerFeature3")}
                  </li>
                </ul>

                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
                  <span>{t("Auth.getStarted")}</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Employer Card */}
            <button
              onClick={() => handleRoleSelect("employer")}
              className="group relative overflow-hidden rounded-2xl border-2 border-black/10 dark:border-white/15 bg-white dark:bg-zinc-950 p-8 text-left transition-all hover:border-black/30 dark:hover:border-white/30 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 rounded-full blur-3xl -z-0" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  {t("Auth.employerAccount")}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  {t("Auth.employerDescription")}
                </p>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <svg
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("Auth.employerFeature1")}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <svg
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("Auth.employerFeature2")}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <svg
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("Auth.employerFeature3")}
                  </li>
                </ul>

                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium group-hover:gap-3 transition-all">
                  <span>{t("Auth.getStarted")}</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            {t("Auth.haveAccount")}{" "}
            <Link
              href={`/${locale}/login`}
              className="font-medium text-black underline underline-offset-4 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {t("Auth.login")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={handleBackToRoleSelection}
          className="mb-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("Auth.backToRoleSelection")}
        </button>

        <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-lg dark:border-white/15 dark:bg-zinc-950">
          <div className="mb-6 text-center">
            <div
              className={`mx-auto mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                selectedRole === "worker"
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600"
              } text-white`}
            >
              {selectedRole === "worker" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              {selectedRole === "worker"
                ? t("Auth.workerAccount")
                : t("Auth.employerAccount")}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t("Auth.fillDetails")}
            </p>
          </div>

          {message ? (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleEmailRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("Auth.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-zinc-700"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("Auth.phone")} {t("Auth.optional")}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-zinc-700"
                placeholder="+84 123 456 789"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("Auth.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-zinc-700"
                placeholder="••••••••"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {t("Auth.passwordHint")}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 rounded-xl bg-black px-4 font-medium text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {loading ? t("Auth.processing") : t("Auth.submit")}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/10 dark:bg-white/15" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("Auth.or")}
            </span>
            <div className="h-px flex-1 bg-black/10 dark:bg-white/15" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 font-medium text-black transition-all hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="18"
              height="18"
              aria-hidden
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.202,6.053,28.834,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.202,6.053,28.834,4,24,4C16.318,4,9.656,8.254,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c4.738,0,9.055-1.816,12.333-4.787l-5.692-4.807C28.555,36.91,26.38,37.8,24,37.8 c-5.202,0-9.619-3.317-11.276-7.946l-6.5,5.013C8.08,39.556,15.477,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.236-2.231,4.166-4.028,5.607 c0.001-0.001,0.002-0.001,0.003-0.002l5.692,4.807C36.647,39.795,44,35,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            {t("Auth.continueWithGoogle")}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            {t("Auth.termsText")}{" "}
            <Link
              href="/terms"
              className="font-medium text-black underline underline-offset-4 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {t("Auth.terms")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
