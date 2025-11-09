import { createAdminClient } from "@/lib/supabase/server";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  Result,
  createSuccess,
  createFailure,
  createError,
  ErrorCodes,
} from "@/lib/types";

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
  
  // New fields from onboarding
  age: number | null;
  height: number | null;
  weight: number | null;
  zodiac_sign: string | null;
  hobbies: string[] | null;
  lifestyle: string | null;
  favorite_quote: string | null;
  introduction: string | null;
  
  // Service fields
  service_type: string | null;
  service_category: string | null; // Legacy field, kept for backward compatibility
  service_categories: string[] | null; // Array of service categories (multiple selections)
  service_level: number | null;
  service_description: string | null;
  service_languages: string[] | null;
  
  // Gallery and images
  gallery_images: string[] | null;
  service_images: string[] | null;
  
  // Pricing fields
  currency: string;
  min_booking_hours: number;
  daily_rate: number | null;
  monthly_rate: number | null;
  service_pricing: Record<string, {
    hourly_rate: number;
    daily_rate: number;
    monthly_rate: number;
    min_booking_hours: number;
  }> | null; // Per-service pricing JSONB
  
  // Setup tracking
  setup_step: number;
  setup_completed: boolean;
  
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
): Promise<Result<WorkerProfile>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching worker profile:", error);

      // Check if it's a "not found" error
      if (error.code === "PGRST116") {
        return createFailure(
          createError(
            ErrorCodes.PROFILE_NOT_FOUND,
            "Worker profile not found",
            { userId, originalError: error }
          )
        );
      }

      // Other database errors
      return createFailure(
        createError(
          ErrorCodes.DATABASE_ERROR,
          "Failed to fetch worker profile",
          { userId, originalError: error }
        )
      );
    }

    return createSuccess(data as WorkerProfile);
  } catch (error) {
    console.error("Unexpected error in getWorkerProfile:", error);
    return createFailure(
      createError(
        ErrorCodes.UNKNOWN_ERROR,
        "An unexpected error occurred",
        { userId, error }
      )
    );
  }
}

export async function getEmployerProfile(
  userId: string
): Promise<Result<EmployerProfile>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("employer_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching employer profile:", error);

      if (error.code === "PGRST116") {
        return createFailure(
          createError(
            ErrorCodes.PROFILE_NOT_FOUND,
            "Employer profile not found",
            { userId, originalError: error }
          )
        );
      }

      return createFailure(
        createError(
          ErrorCodes.DATABASE_ERROR,
          "Failed to fetch employer profile",
          { userId, originalError: error }
        )
      );
    }

    return createSuccess(data as EmployerProfile);
  } catch (error) {
    console.error("Unexpected error in getEmployerProfile:", error);
    return createFailure(
      createError(
        ErrorCodes.UNKNOWN_ERROR,
        "An unexpected error occurred",
        { userId, error }
      )
    );
  }
}

export async function getWorkerProfileWithUser(
  userId: string
): Promise<Result<WorkerProfileWithUser>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worker_profiles_with_user")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching worker profile with user:", error);

      if (error.code === "PGRST116") {
        return createFailure(
          createError(
            ErrorCodes.PROFILE_NOT_FOUND,
            "Worker profile not found",
            { userId, originalError: error }
          )
        );
      }

      return createFailure(
        createError(
          ErrorCodes.DATABASE_ERROR,
          "Failed to fetch worker profile",
          { userId, originalError: error }
        )
      );
    }

    return createSuccess(data as WorkerProfileWithUser);
  } catch (error) {
    console.error("Unexpected error in getWorkerProfileWithUser:", error);
    return createFailure(
      createError(
        ErrorCodes.UNKNOWN_ERROR,
        "An unexpected error occurred",
        { userId, error }
      )
    );
  }
}

export async function getEmployerProfileWithUser(
  userId: string
): Promise<Result<EmployerProfileWithUser>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("employer_profiles_with_user")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching employer profile with user:", error);

      if (error.code === "PGRST116") {
        return createFailure(
          createError(
            ErrorCodes.PROFILE_NOT_FOUND,
            "Employer profile not found",
            { userId, originalError: error }
          )
        );
      }

      return createFailure(
        createError(
          ErrorCodes.DATABASE_ERROR,
          "Failed to fetch employer profile",
          { userId, originalError: error }
        )
      );
    }

    return createSuccess(data as EmployerProfileWithUser);
  } catch (error) {
    console.error("Unexpected error in getEmployerProfileWithUser:", error);
    return createFailure(
      createError(
        ErrorCodes.UNKNOWN_ERROR,
        "An unexpected error occurred",
        { userId, error }
      )
    );
  }
}

export async function updateWorkerProfile(
  userId: string,
  updates: Partial<Omit<WorkerProfile, "id" | "created_at" | "updated_at">>
): Promise<Result<WorkerProfile>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worker_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating worker profile:", error);

      if (error.code === "PGRST116") {
        return createFailure(
          createError(
            ErrorCodes.PROFILE_NOT_FOUND,
            "Worker profile not found",
            { userId, originalError: error }
          )
        );
      }

      return createFailure(
        createError(
          ErrorCodes.DATABASE_ERROR,
          "Failed to update worker profile",
          { userId, originalError: error }
        )
      );
    }

    return createSuccess(data as WorkerProfile);
  } catch (error) {
    console.error("Unexpected error in updateWorkerProfile:", error);
    return createFailure(
      createError(
        ErrorCodes.UNKNOWN_ERROR,
        "An unexpected error occurred",
        { userId, error }
      )
    );
  }
}

export async function updateEmployerProfile(
  userId: string,
  updates: Partial<Omit<EmployerProfile, "id" | "created_at" | "updated_at">>
): Promise<Result<EmployerProfile>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("employer_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating employer profile:", error);

      if (error.code === "PGRST116") {
        return createFailure(
          createError(
            ErrorCodes.PROFILE_NOT_FOUND,
            "Employer profile not found",
            { userId, originalError: error }
          )
        );
      }

      return createFailure(
        createError(
          ErrorCodes.DATABASE_ERROR,
          "Failed to update employer profile",
          { userId, originalError: error }
        )
      );
    }

    return createSuccess(data as EmployerProfile);
  } catch (error) {
    console.error("Unexpected error in updateEmployerProfile:", error);
    return createFailure(
      createError(
        ErrorCodes.UNKNOWN_ERROR,
        "An unexpected error occurred",
        { userId, error }
      )
    );
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

/**
 * Reviews and Ratings
 */

export interface Review {
  id: string;
  booking_id: string | null;
  worker_id: string;
  employer_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[] | null;
  helpful_count: number;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  // From join
  employer_name: string | null;
  employer_avatar: string | null;
  worker_response: string | null;
  response_created_at: string | null;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export async function getWorkerReviews(
  workerId: string,
  limit: number = 10
): Promise<Review[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("reviews_with_user")
      .select("*")
      .eq("worker_id", workerId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    return (data as Review[]) || [];
  } catch (error) {
    console.error("Unexpected error in getWorkerReviews:", error);
    return [];
  }
}

export async function getRatingDistribution(
  workerId: string
): Promise<RatingDistribution> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("worker_id", workerId);

    if (error || !data) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof RatingDistribution]++;
      }
    });

    return distribution;
  } catch (error) {
    console.error("Unexpected error in getRatingDistribution:", error);
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }
}

export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
}

export function formatCurrency(amount: number, currency: string): string {
  const currencyMap: Record<string, { locale: string; currency: string }> = {
    USD: { locale: "en-US", currency: "USD" },
    VND: { locale: "vi-VN", currency: "VND" },
    EUR: { locale: "de-DE", currency: "EUR" },
    JPY: { locale: "ja-JP", currency: "JPY" },
    KRW: { locale: "ko-KR", currency: "KRW" },
    CNY: { locale: "zh-CN", currency: "CNY" },
  };

  const config = currencyMap[currency] || currencyMap.USD;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
  }).format(amount);
}

