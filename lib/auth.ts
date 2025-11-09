import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Extended User type that includes admin role
 */
export interface AuthUser {
  id: string;
  email: string;
  role: "worker" | "employer" | "admin";
  phone: string | null;
  preferred_language: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get the current authenticated user from server component
 * This works in Next.js App Router server components
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    // Get user data from the users table
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching current user:", error);
      return null;
    }

    return data as AuthUser;
  } catch (error) {
    console.error("Unexpected error in getCurrentUser:", error);
    return null;
  }
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/**
 * Check if the current user is a worker
 */
export async function isWorker(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "worker";
}

/**
 * Check if the current user is an employer
 */
export async function isEmployer(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "employer";
}

