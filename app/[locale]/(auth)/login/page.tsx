"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useT, useLocale } from "@/i18n/provider";

export default function LoginPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-lg dark:border-white/15 dark:bg-zinc-950 text-center">
            <div className="mx-auto mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
              Bạn đã đăng nhập rồi
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Bạn đang trong phiên đăng nhập. Vui lòng đăng xuất nếu muốn đăng nhập tài khoản khác.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-block w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-center font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/50"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Redirect to home page after successful login
      router.push(`/${locale}`);
    } catch {
      setError(t("Auth.unknownError"));
    } finally {
      setLoading(false);
    }
  }

  // Google OAuth đã bị XÓA khỏi trang login
  // Lý do: Login không có role selection, nên không thể dùng OAuth
  // User cần đăng ký qua /register (có chọn role) nếu muốn dùng Google

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-lg dark:border-white/15 dark:bg-zinc-950">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
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
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              {t("Auth.loginTitle")}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t("Auth.loginSubtitle")}
            </p>
          </div>

          {/* Error Message */}
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {/* Login Form */}
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {t("Auth.password")}
                </label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t("Auth.forgotPassword")}
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-zinc-700"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 rounded-xl bg-black px-4 font-medium text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {loading ? t("Auth.processing") : t("Auth.loginButton")}
            </button>
          </form>

          {/* Info: Google OAuth removed from login page */}
          <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
              💡 {t("Auth.googleSignupOnly")}
            </p>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            {t("Auth.noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="font-medium text-black underline underline-offset-4 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {t("Auth.signUp")}
            </Link>
          </p>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            {t("Auth.needHelp")}{" "}
            <Link
              href={`/${locale}/support`}
              className="font-medium text-zinc-700 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              {t("Auth.contactSupport")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
