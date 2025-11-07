"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useLocale } from "@/i18n/provider";

/**
 * Auth Callback Page
 * 
 * Xử lý OAuth callback (Google, etc.)
 * Đảm bảo user profile được tạo với role đúng
 */

export default function AuthCallbackPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = getSupabaseClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    handleAuthCallback();
  }, []);

  async function handleAuthCallback() {
    try {
      // 1. Check URL params cho role (từ register page)
      const params = new URLSearchParams(window.location.search);
      const roleFromParams = params.get("role") as "worker" | "employer" | null;

      // 2. Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setStatus("error");
        setMessage("Authentication failed. Please try again.");
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
        return;
      }

      const user = session.user;
      console.log("✅ User authenticated:", user.email);

      // 3. Check if user profile exists in public.users
      const checkResponse = await fetch(
        `/api/auth/create-user-profile?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const checkResult = await checkResponse.json();

      // 4. Handle EXISTING USER (Login)
      if (checkResult.exists && checkResult.user) {
        console.log("✅ Existing user, logging in with role:", checkResult.user.role);
        
        // Redirect based on EXISTING role (không thay đổi role)
        setStatus("success");
        setMessage("Welcome back! Redirecting...");
        
        setTimeout(() => {
          // Redirect về homepage hoặc dashboard
          router.push(`/${locale}`);
        }, 1000);
        return;
      }

      // 5. Handle NEW USER (Register)
      // PHẢI có role từ params (từ register page)
      if (!roleFromParams) {
        console.error("❌ New user but no role specified!");
        setStatus("error");
        setMessage("Registration error: Role is required. Please register again.");
        
        setTimeout(() => {
          router.push(`/${locale}/register`);
        }, 2000);
        return;
      }

      // Validate role
      if (!["worker", "employer"].includes(roleFromParams)) {
        console.error("❌ Invalid role:", roleFromParams);
        setStatus("error");
        setMessage("Registration error: Invalid role. Please register again.");
        
        setTimeout(() => {
          router.push(`/${locale}/register`);
        }, 2000);
        return;
      }

      // 6. Create user profile for NEW USER
      console.log("📝 Creating NEW user profile with role:", roleFromParams);
      
      const createResponse = await fetch("/api/auth/create-user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          role: roleFromParams,
          phone: user.user_metadata?.phone || null,
          preferred_language: user.user_metadata?.preferred_language || locale,
        }),
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok) {
        console.error("❌ Failed to create profile:", createResult);
        setStatus("error");
        setMessage("Failed to create profile. Please contact support.");
        
        setTimeout(() => {
          router.push(`/${locale}/register`);
        }, 2000);
        return;
      }

      console.log("✅ User profile created:", createResult);

      // 7. Redirect NEW USER based on their selected role
      setStatus("success");
      setMessage("Registration successful! Redirecting...");
      
      setTimeout(() => {
        router.push(`/${locale}`);
      }, 1000);

    } catch (error) {
      console.error("Error in auth callback:", error);
      setStatus("error");
      setMessage("An error occurred. Redirecting to login...");
      
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 2000);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black px-4">
      <div className="text-center">
        {/* Loading Spinner */}
        {status === "loading" && (
          <div className="mb-4 inline-flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-black dark:border-zinc-800 dark:border-t-white"></div>
          </div>
        )}

        {/* Success Icon */}
        {status === "success" && (
          <div className="mb-4 inline-flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
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
            </div>
          </div>
        )}

        {/* Error Icon */}
        {status === "error" && (
          <div className="mb-4 inline-flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Message */}
        <p className="text-lg font-medium text-black dark:text-white">
          {message}
        </p>
      </div>
    </div>
  );
}

