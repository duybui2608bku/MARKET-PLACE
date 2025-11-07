import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * User Data Types
 */

export type UserRole = "worker" | "employer";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  phone: string | null;
  preferred_language: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Server-side user queries (using Admin client)
 */

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error("Unexpected error in getUserById:", error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error("Unexpected error in getUserByEmail:", error);
    return null;
  }
}

export async function getWorkers(limit = 50): Promise<User[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Error fetching workers:", error);
      return [];
    }

    return data as User[];
  } catch (error) {
    console.error("Unexpected error in getWorkers:", error);
    return [];
  }
}

export async function getEmployers(limit = 50): Promise<User[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("employers")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Error fetching employers:", error);
      return [];
    }

    return data as User[];
  } catch (error) {
    console.error("Unexpected error in getEmployers:", error);
    return [];
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, "id" | "email" | "created_at" | "updated_at">>
): Promise<User | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error("Unexpected error in updateUserProfile:", error);
    return null;
  }
}

/**
 * Client-side user queries (using Client with auth)
 */

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = getSupabaseClient();

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    // Query user profile
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching current user:", error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error("Unexpected error in getCurrentUser:", error);
    return null;
  }
}

export async function updateCurrentUserProfile(
  updates: Partial<Omit<User, "id" | "email" | "role" | "created_at" | "updated_at">>
): Promise<User | null> {
  try {
    const supabase = getSupabaseClient();

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      console.error("No active session");
      return null;
    }

    // Update user profile
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating current user profile:", error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error("Unexpected error in updateCurrentUserProfile:", error);
    return null;
  }
}

/**
 * Utility functions
 */

export function isWorker(user: User | null): boolean {
  return user?.role === "worker";
}

export function isEmployer(user: User | null): boolean {
  return user?.role === "employer";
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return "Guest";
  return user.full_name || user.email;
}

