import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Get authenticated user using Supabase SSR
 * This uses the same pattern as other working APIs (upload-avatar)
 */
export async function getAuthenticatedUser() {
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get user from session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { user: null, error: "Unauthorized - No active session" };
    }

    return { user: session.user, error: null };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return { user: null, error: "Authentication failed" };
  }
}

