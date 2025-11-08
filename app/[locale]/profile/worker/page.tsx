"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUser, type User } from "@/lib/users";
import {
  getCurrentWorkerProfile,
  type WorkerProfile,
  formatCurrency,
  formatRating,
} from "@/lib/profiles";
import { useT, useLocale } from "@/i18n/provider";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";

export default function WorkerProfilePage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const t = useT();
  const locale = useLocale();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session) {
        router.push(`/${locale}/login`);
        return;
      }

      const userData = await getCurrentUser();
      if (!userData) {
        router.push(`/${locale}/login`);
        return;
      }

      if (userData.role !== "worker") {
        router.push(`/${locale}/profile/employer`);
        return;
      }

      setUser(userData);

      const profileData = await getCurrentWorkerProfile();
      if (profileData) {
        setProfile(profileData);
        
        // Redirect to onboarding if not completed
        if (!profileData.setup_completed) {
          router.push(`/${locale}/worker-onboarding`);
          return;
        }
      }
    } catch (err) {
      console.error("Error checking auth:", err);
    } finally {
      setLoading(false);
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white pt-16 dark:bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400" />
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white pt-16 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.profileNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Actions */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              {t("WorkerProfile.title")}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t("WorkerProfile.subtitle")}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={`/${locale}/worker/${user.id}`}>
              <button className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 font-medium text-black transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t("WorkerProfile.viewPublicProfile")}
              </button>
            </Link>
            <Link href={`/${locale}/worker-onboarding`}>
              <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition-all hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t("WorkerProfile.editFullProfile")}
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-white p-6 dark:border-zinc-800 dark:from-blue-950/20 dark:to-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.totalJobs")}</p>
                <p className="mt-1 text-3xl font-bold text-black dark:text-white">
                  {profile.total_jobs}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-green-50 to-white p-6 dark:border-zinc-800 dark:from-green-950/20 dark:to-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.completed")}</p>
                <p className="mt-1 text-3xl font-bold text-black dark:text-white">
                  {profile.completed_jobs}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-yellow-50 to-white p-6 dark:border-zinc-800 dark:from-yellow-950/20 dark:to-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.rating")}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-3xl font-bold text-black dark:text-white">
                    {formatRating(profile.rating)}
                  </p>
                  {renderStars(profile.rating)}
                </div>
              </div>
              <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-purple-50 to-white p-6 dark:border-zinc-800 dark:from-purple-950/20 dark:to-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.reviews")}</p>
                <p className="mt-1 text-3xl font-bold text-black dark:text-white">
                  {profile.total_reviews}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start gap-6">
                {user.avatar_url && (
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-zinc-900">
                    <Image src={user.avatar_url} alt={user.full_name || "Worker"} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    {user.full_name || t("WorkerProfile.unnamedWorker")}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {profile.city && (
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {profile.city}
                      </span>
                    )}
                    {profile.experience_years > 0 && (
                      <>
                        <span>•</span>
                        <span>{profile.experience_years}+ {t("WorkerProfile.yearsExperience")}</span>
                      </>
                    )}
                    {profile.is_verified && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {t("WorkerProfile.verified")}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                      profile.available
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${
                        profile.available ? "bg-green-600" : "bg-zinc-600"
                      }`} />
                      {profile.available ? t("WorkerProfile.available") : t("WorkerProfile.unavailable")}
                    </span>
                    {profile.service_type && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                        {profile.service_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            {(profile.age || profile.height || profile.weight || profile.zodiac_sign) && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  {t("WorkerProfile.personalInformation")}
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {profile.age && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-black dark:text-white">{profile.age}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.age")}</p>
                    </div>
                  )}
                  {profile.height && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-black dark:text-white">{profile.height}cm</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.height")}</p>
                    </div>
                  )}
                  {profile.weight && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-black dark:text-white">{profile.weight}kg</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.weight")}</p>
                    </div>
                  )}
                  {profile.zodiac_sign && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-black dark:text-white">{profile.zodiac_sign}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.zodiac")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gallery */}
            {profile.gallery_images && profile.gallery_images.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  {t("WorkerProfile.gallery")} ({profile.gallery_images.length} {t("WorkerProfile.photos")})
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {profile.gallery_images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-xl">
                      <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Introduction & Details */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                {t("WorkerProfile.aboutMe")}
              </h3>
              {profile.introduction && (
                <p className="mb-4 text-zinc-700 dark:text-zinc-300">{profile.introduction}</p>
              )}
              {profile.bio && (
                <div className="mb-4">
                  <h4 className="mb-2 font-medium text-black dark:text-white">{t("WorkerProfile.experience")}</h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{profile.bio}</p>
                </div>
              )}
              {profile.lifestyle && (
                <div className="mb-4">
                  <h4 className="mb-2 font-medium text-black dark:text-white">{t("WorkerProfile.lifestyle")}</h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{profile.lifestyle}</p>
                </div>
              )}
              {profile.favorite_quote && (
                <div className="rounded-xl border-l-4 border-blue-600 bg-zinc-50 p-4 dark:border-blue-400 dark:bg-zinc-900/50">
                  <p className="text-sm italic text-zinc-900 dark:text-zinc-100">
                    "{profile.favorite_quote}"
                  </p>
                </div>
              )}
            </div>

            {/* Skills & Hobbies */}
            {((profile.skills && profile.skills.length > 0) || (profile.hobbies && profile.hobbies.length > 0)) && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-3 font-semibold text-black dark:text-white">{t("WorkerProfile.skills")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.hobbies && profile.hobbies.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-semibold text-black dark:text-white">{t("WorkerProfile.hobbies")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.hobbies.map((hobby) => (
                        <span key={hobby} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            {profile.hourly_rate && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  {t("WorkerProfile.pricing")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.hourly")}</span>
                    <span className="text-lg font-bold text-black dark:text-white">
                      {formatCurrency(profile.hourly_rate, profile.currency)}
                    </span>
                  </div>
                  {profile.daily_rate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.daily")}</span>
                      <span className="text-lg font-bold text-black dark:text-white">
                        {formatCurrency(profile.daily_rate, profile.currency)}
                      </span>
                    </div>
                  )}
                  {profile.monthly_rate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.monthly")}</span>
                      <span className="text-lg font-bold text-black dark:text-white">
                        {formatCurrency(profile.monthly_rate, profile.currency)}
                      </span>
                    </div>
                  )}
                </div>
                {profile.min_booking_hours && (
                  <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
                    {t("WorkerProfile.minimumBookingHours").replace("{hours}", profile.min_booking_hours.toString())}
                  </p>
                )}
              </div>
            )}

            {/* Service Info */}
            {profile.service_type && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  {t("WorkerProfile.service")}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.type")}:</span>
                    <span className="font-medium capitalize text-black dark:text-white">
                      {profile.service_type}
                    </span>
                  </div>
                  {profile.service_category && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.category")}:</span>
                      <span className="font-medium text-black dark:text-white">
                        {profile.service_category.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  {profile.service_level && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">{t("WorkerProfile.level")}:</span>
                      <span className="font-medium text-black dark:text-white">
                        Level {profile.service_level}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-white p-6 dark:border-zinc-800 dark:from-blue-950/20 dark:to-black">
              <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                {t("WorkerProfile.quickActions")}
              </h3>
              <div className="space-y-2">
                <Link href={`/${locale}/worker-onboarding`} className="block">
                  <button className="flex w-full items-center gap-2 rounded-xl bg-white p-3 text-left text-sm font-medium text-black transition-all hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t("WorkerProfile.editProfile")}
                  </button>
                </Link>
                <Link href={`/${locale}/worker/${user.id}`} className="block">
                  <button className="flex w-full items-center gap-2 rounded-xl bg-white p-3 text-left text-sm font-medium text-black transition-all hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {t("WorkerProfile.viewPublicProfile")}
                  </button>
                </Link>
              </div>
            </div>

            {/* Availability Calendar */}
            <AvailabilityCalendar workerId={user.id} isEditable={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
