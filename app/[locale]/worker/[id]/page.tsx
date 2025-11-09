"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  type WorkerProfileWithUser,
  getWorkerReviews,
  getRatingDistribution,
  formatCurrency,
  type Review,
  type RatingDistribution,
} from "@/lib/profiles";
import { useT, useLocale } from "@/i18n/provider";
import ReviewsSection from "@/components/ReviewsSection";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";

export default function WorkerProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const supabase = getSupabaseClient();

  const workerId = params.id as string;

  const [profile, setProfile] = useState<WorkerProfileWithUser | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDist, setRatingDist] = useState<RatingDistribution>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  useEffect(() => {
    loadWorkerProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  async function loadWorkerProfile() {
    try {
      // Fetch worker profile with user data
      const { data: profileData, error: profileError } = await supabase
        .from("worker_profiles_with_user")
        .select("*")
        .eq("id", workerId)
        .single();

      if (profileError || !profileData) {
        console.error("Error loading profile:", profileError);
        router.push(`/${locale}`);
        return;
      }

      setProfile(profileData as WorkerProfileWithUser);

      // Fetch reviews
      const reviewsData = await getWorkerReviews(workerId, 10);
      setReviews(reviewsData);

      // Fetch rating distribution
      const distribution = await getRatingDistribution(workerId);
      setRatingDist(distribution);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const displayImages =
    profile?.gallery_images && profile.gallery_images.length > 0
      ? profile.gallery_images
      : profile?.avatar_url
      ? [profile.avatar_url]
      : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">
          {t("PublicProfile.profileNotFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            {t("PublicProfile.backToMarketplace")}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Slider */}
            {displayImages.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={displayImages[currentImageIndex]}
                    alt={profile.full_name || "Worker"}
                    fill
                    className="object-cover"
                    priority
                  />
                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                      >
                        <svg
                          className="h-6 w-6"
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
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                        {currentImageIndex + 1} / {displayImages.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {displayImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {displayImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ${
                          idx === currentImageIndex
                            ? "ring-2 ring-blue-600 dark:ring-blue-400"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Name & Status */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white">
                      {profile.full_name || t("PublicProfile.unnamedWorker")}
                    </h1>
                    <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {profile.city && profile.district
                        ? `${profile.district}, ${profile.city}`
                        : profile.city ||
                          t("PublicProfile.locationNotSpecified")}
                      {profile.is_verified && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {t("PublicProfile.verified")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full border border-zinc-300 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                    <button className="rounded-full border border-zinc-300 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Info Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {profile.age && (
                  <div className="text-center">
                    <div className="flex justify-center">
                      <svg
                        className="h-8 w-8 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {t("PublicProfile.age")}
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {profile.age} {t("PublicProfile.yearsOld")}
                    </p>
                  </div>
                )}
                {profile.height && (
                  <div className="text-center">
                    <div className="flex justify-center">
                      <svg
                        className="h-8 w-8 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {t("PublicProfile.height")}
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {profile.height} cm
                    </p>
                  </div>
                )}
                {profile.weight && (
                  <div className="text-center">
                    <div className="flex justify-center">
                      <svg
                        className="h-8 w-8 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                        />
                      </svg>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {t("PublicProfile.weight")}
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {profile.weight} kg
                    </p>
                  </div>
                )}
                {profile.zodiac_sign && (
                  <div className="text-center">
                    <div className="flex justify-center">
                      <svg
                        className="h-8 w-8 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {t("PublicProfile.zodiac")}
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {profile.zodiac_sign}
                    </p>
                  </div>
                )}
              </div>

              {/* Introduction */}
              {profile.introduction && (
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white">
                    {t("PublicProfile.introduction")}
                  </h2>
                  <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                    {profile.introduction}
                  </p>
                </div>
              )}

              {/* Hobbies/Skills */}
              {profile.hobbies && profile.hobbies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    {t("PublicProfile.hobbies")}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.hobbies.map((hobby) => (
                      <span
                        key={hobby}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                      >
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    {t("PublicProfile.skills")}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle */}
              {profile.lifestyle && (
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    {t("PublicProfile.lifestyle")}
                  </h3>
                  <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                    {profile.lifestyle}
                  </p>
                </div>
              )}

              {/* Favorite Quote */}
              {profile.favorite_quote && (
                <div className="rounded-xl border-l-4 border-blue-600 bg-zinc-50 p-4 dark:border-blue-400 dark:bg-zinc-900/50">
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {t("PublicProfile.favoriteQuote")}
                  </p>
                  <p className="mt-1 italic text-zinc-900 dark:text-zinc-100">
                    &ldquo;{profile.favorite_quote}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <ReviewsSection
              reviews={reviews}
              averageRating={profile.rating || 0}
              totalReviews={profile.total_reviews || 0}
              ratingDistribution={ratingDist}
            />
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:sticky lg:top-4 lg:h-fit">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
              {/* Service Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {t("PublicProfile.serviceProvided")}
                  </h3>
                  {profile.available && (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                      <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                      {t("PublicProfile.availableNow")}
                    </span>
                  )}
                </div>
                {profile.service_type && (
                  <p className="mt-1 text-sm capitalize text-zinc-600 dark:text-zinc-400">
                    {profile.service_type === "assistance"
                      ? t("PublicProfile.assistance")
                      : t("PublicProfile.companionship")}{" "}
                    •{" "}
                    {profile.service_categories &&
                    profile.service_categories.length > 0
                      ? profile.service_categories
                          .map((cat) => cat.replace(/_/g, " "))
                          .join(", ")
                      : profile.service_category
                      ? profile.service_category.replace(/_/g, " ")
                      : `Level ${profile.service_level}`}
                  </p>
                )}
              </div>

              {/* Service Cards with Pricing - Slider if multiple services */}
              {(() => {
                // Get services with pricing
                const services =
                  profile.service_categories &&
                  profile.service_categories.length > 0
                    ? profile.service_categories
                    : profile.service_category
                    ? [profile.service_category]
                    : [];

                const servicePricing = profile.service_pricing || {};
                const hasMultipleServices = services.length > 1;

                if (services.length === 0 && !profile.hourly_rate) return null;

                const categoryNames: Record<string, string> = {
                  personal_assist: "Hỗ Trợ Cá Nhân",
                  professional_onsite_assist: "Hỗ Trợ Chuyên Nghiệp",
                  virtual_assist: "Hỗ Trợ Từ Xa",
                  tour_guide: "Hướng Dẫn Viên",
                  translator: "Phiên Dịch",
                };

                return (
                  <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                        {t("PublicProfile.pricing")}
                      </h4>
                      {hasMultipleServices && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setCurrentServiceIndex((prev) =>
                                Math.max(0, prev - 1)
                              )
                            }
                            disabled={currentServiceIndex === 0}
                            className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed dark:text-zinc-400 dark:hover:bg-zinc-800"
                          >
                            <svg
                              className="h-5 w-5"
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
                          </button>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {currentServiceIndex + 1} / {services.length}
                          </span>
                          <button
                            onClick={() =>
                              setCurrentServiceIndex((prev) =>
                                Math.min(services.length - 1, prev + 1)
                              )
                            }
                            disabled={
                              currentServiceIndex === services.length - 1
                            }
                            className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed dark:text-zinc-400 dark:hover:bg-zinc-800"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Service Cards Container */}
                    <div className="relative w-full overflow-hidden">
                      <div
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{
                          transform: hasMultipleServices
                            ? `translateX(-${currentServiceIndex * 100}%)`
                            : "translateX(0)",
                        }}
                      >
                        {services.map((serviceCategory, index) => {
                          const pricing = servicePricing[serviceCategory] || {
                            hourly_rate: profile.hourly_rate || 0,
                            daily_rate: profile.daily_rate || 0,
                            monthly_rate: profile.monthly_rate || 0,
                            min_booking_hours: profile.min_booking_hours || 2,
                          };

                          return (
                            <div
                              key={serviceCategory}
                              className="w-full flex-shrink-0 space-y-2 px-1"
                              style={{
                                minWidth: "100%",
                                maxWidth: "100%",
                              }}
                            >
                              {hasMultipleServices && (
                                <p className="mb-2 text-sm font-medium text-black dark:text-white">
                                  {categoryNames[serviceCategory] ||
                                    serviceCategory.replace(/_/g, " ")}
                                </p>
                              )}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span className="text-sm">
                                      {t("PublicProfile.hourlyRate")}
                                    </span>
                                  </div>
                                  <p className="text-xl font-bold text-black dark:text-white">
                                    {formatCurrency(
                                      pricing.hourly_rate,
                                      profile.currency
                                    )}
                                  </p>
                                </div>
                                {pricing.daily_rate > 0 && (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                      <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <span className="text-sm">
                                        {t("PublicProfile.dailyRate")}
                                      </span>
                                    </div>
                                    <p className="text-xl font-bold text-black dark:text-white">
                                      {formatCurrency(
                                        pricing.daily_rate,
                                        profile.currency
                                      )}
                                    </p>
                                  </div>
                                )}
                                {pricing.monthly_rate > 0 && (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                      <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <span className="text-sm">
                                        {t("PublicProfile.monthlyRate")}
                                      </span>
                                    </div>
                                    <p className="text-xl font-bold text-black dark:text-white">
                                      {formatCurrency(
                                        pricing.monthly_rate,
                                        profile.currency
                                      )}
                                    </p>
                                  </div>
                                )}
                                {pricing.min_booking_hours > 0 && (
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {t(
                                      "PublicProfile.minimumBookingHours"
                                    ).replace(
                                      "{hours}",
                                      pricing.min_booking_hours.toString()
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fallback for legacy single pricing */}
                    {services.length === 0 && profile.hourly_rate && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm">
                              {t("PublicProfile.hourlyRate")}
                            </span>
                          </div>
                          <p className="text-xl font-bold text-black dark:text-white">
                            {formatCurrency(
                              profile.hourly_rate,
                              profile.currency
                            )}
                          </p>
                        </div>
                        {profile.daily_rate && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm">
                                {t("PublicProfile.dailyRate")}
                              </span>
                            </div>
                            <p className="text-xl font-bold text-black dark:text-white">
                              {formatCurrency(
                                profile.daily_rate,
                                profile.currency
                              )}
                            </p>
                          </div>
                        )}
                        {profile.monthly_rate && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm">
                                {t("PublicProfile.monthlyRate")}
                              </span>
                            </div>
                            <p className="text-xl font-bold text-black dark:text-white">
                              {formatCurrency(
                                profile.monthly_rate,
                                profile.currency
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Additional Info */}
              <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                {profile.experience_years !== undefined &&
                  profile.experience_years > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {t("PublicProfile.experience")}:{" "}
                        <strong>
                          {profile.experience_years}+ {t("PublicProfile.years")}
                        </strong>
                      </span>
                    </div>
                  )}
                {profile.min_booking_hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {t("PublicProfile.responseTime")}:{" "}
                      <strong>
                        {t("PublicProfile.withinHours").replace(
                          "{hours}",
                          profile.min_booking_hours.toString()
                        )}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Book Button */}
              <button className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white transition-all hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {t("PublicProfile.bookService")}
              </button>

              {/* Contact */}
              <button className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 font-semibold text-black transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                {t("PublicProfile.sendMessage")}
              </button>
            </div>

            {/* Availability Calendar */}
            <div className="mt-6">
              <AvailabilityCalendar workerId={workerId} isEditable={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
