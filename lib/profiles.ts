import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Profile Data Types
 */

export interface WorkerProfile {
  id: string;
  bio: string | null;
  skills: string[] | null;
  experience_years: number;
  hourly_rate: number | null;
  address: string | null;
  city: string | null;
  district: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  portfolio_images: string[] | null;
  certifications: string[] | null;
  languages: string[];
  available: boolean;
  available_from: string | null;
  available_to: string | null;
  working_days: string[];
  total_jobs: number;
  completed_jobs: number;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  verified_at: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployerProfile {
  id: string;
  company_name: string | null;
  company_description: string | null;
  industry: string | null;
  company_size: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  country: string;
  company_phone: string | null;
  company_email: string | null;
  website_url: string | null;
  total_jobs_posted: number;
  total_hires: number;
  is_verified: boolean;
  verified_at: string | null;
  tax_code: string | null;
  business_license: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkerProfileWithUser extends WorkerProfile {
  email: string;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
}

export interface EmployerProfileWithUser extends EmployerProfile {
  email: string;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
}

/**
 * Server-side profile queries (using Admin client)
 */

export async function getWorkerProfile(
  userId: string
): Promise<WorkerProfile | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching worker profile:", error);
      return null;
    }

    return data as WorkerProfile;
  } catch (error) {
    console.error("Unexpected error in getWorkerProfile:", error);
    return null;
  }
}

export async function getEmployerProfile(
  userId: string
): Promise<EmployerProfile | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("employer_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching employer profile:", error);
      return null;
    }

    return data as EmployerProfile;
  } catch (error) {
    console.error("Unexpected error in getEmployerProfile:", error);
    return null;
  }
}

export async function getWorkerProfileWithUser(
  userId: string
): Promise<WorkerProfileWithUser | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("worker_profiles_with_user")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching worker profile with user:", error);
      return null;
    }

    return data as WorkerProfileWithUser;
  } catch (error) {
    console.error("Unexpected error in getWorkerProfileWithUser:", error);
    return null;
  }
}

export async function getEmployerProfileWithUser(
  userId: string
): Promise<EmployerProfileWithUser | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("employer_profiles_with_user")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching employer profile with user:", error);
      return null;
    }

    return data as EmployerProfileWithUser;
  } catch (error) {
    console.error("Unexpected error in getEmployerProfileWithUser:", error);
    return null;
  }
}

export async function updateWorkerProfile(
  userId: string,
  updates: Partial<Omit<WorkerProfile, "id" | "created_at" | "updated_at">>
): Promise<WorkerProfile | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("worker_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating worker profile:", error);
      return null;
    }

    return data as WorkerProfile;
  } catch (error) {
    console.error("Unexpected error in updateWorkerProfile:", error);
    return null;
  }
}

export async function updateEmployerProfile(
  userId: string,
  updates: Partial<Omit<EmployerProfile, "id" | "created_at" | "updated_at">>
): Promise<EmployerProfile | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("employer_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating employer profile:", error);
      return null;
    }

    return data as EmployerProfile;
  } catch (error) {
    console.error("Unexpected error in updateEmployerProfile:", error);
    return null;
  }
}

/**
 * Client-side profile queries (using Client with auth)
 */

export async function getCurrentWorkerProfile(): Promise<WorkerProfile | null> {
  try {
    const supabase = getSupabaseClient();

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    // Query worker profile
    const { data, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching current worker profile:", error);
      return null;
    }

    return data as WorkerProfile;
  } catch (error) {
    console.error("Unexpected error in getCurrentWorkerProfile:", error);
    return null;
  }
}

export async function getCurrentEmployerProfile(): Promise<EmployerProfile | null> {
  try {
    const supabase = getSupabaseClient();

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    // Query employer profile
    const { data, error } = await supabase
      .from("employer_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching current employer profile:", error);
      return null;
    }

    return data as EmployerProfile;
  } catch (error) {
    console.error("Unexpected error in getCurrentEmployerProfile:", error);
    return null;
  }
}

export async function updateCurrentWorkerProfile(
  updates: Partial<Omit<WorkerProfile, "id" | "created_at" | "updated_at">>
): Promise<WorkerProfile | null> {
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

    // Update worker profile
    const { data, error } = await supabase
      .from("worker_profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating current worker profile:", error);
      return null;
    }

    return data as WorkerProfile;
  } catch (error) {
    console.error("Unexpected error in updateCurrentWorkerProfile:", error);
    return null;
  }
}

export async function updateCurrentEmployerProfile(
  updates: Partial<Omit<EmployerProfile, "id" | "created_at" | "updated_at">>
): Promise<EmployerProfile | null> {
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

    // Update employer profile
    const { data, error } = await supabase
      .from("employer_profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating current employer profile:", error);
      return null;
    }

    return data as EmployerProfile;
  } catch (error) {
    console.error("Unexpected error in updateCurrentEmployerProfile:", error);
    return null;
  }
}

/**
 * Utility functions
 */

export function calculateProfileCompletion(
  profile: WorkerProfile | EmployerProfile,
  role: "worker" | "employer"
): number {
  if (role === "worker") {
    const wp = profile as WorkerProfile;
    let completed = 0;
    let total = 0;

    // Required fields
    const requiredFields = [
      wp.bio,
      wp.skills && wp.skills.length > 0,
      wp.city,
      wp.hourly_rate,
      wp.experience_years !== null,
    ];

    requiredFields.forEach((field) => {
      total++;
      if (field) completed++;
    });

    // Optional but important fields
    const optionalFields = [
      wp.address,
      wp.portfolio_images && wp.portfolio_images.length > 0,
      wp.certifications && wp.certifications.length > 0,
    ];

    optionalFields.forEach((field) => {
      total++;
      if (field) completed++;
    });

    return Math.round((completed / total) * 100);
  } else {
    const ep = profile as EmployerProfile;
    let completed = 0;
    let total = 0;

    // Required fields
    const requiredFields = [
      ep.company_name,
      ep.company_description,
      ep.industry,
      ep.city,
    ];

    requiredFields.forEach((field) => {
      total++;
      if (field) completed++;
    });

    // Optional but important fields
    const optionalFields = [
      ep.address,
      ep.company_phone,
      ep.company_email,
      ep.website_url,
    ];

    optionalFields.forEach((field) => {
      total++;
      if (field) completed++;
    });

    return Math.round((completed / total) * 100);
  }
}

export function formatHourlyRate(rate: number | null): string {
  if (!rate) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(rate);
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

