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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Heart,
  Share2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Star,
  MessageCircle,
  Loader2,
  TrendingUp,
  Weight,
} from "lucide-react";

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

      console.log("👤 Profile Data:", profileData);

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
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">{t("PublicProfile.profileNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("PublicProfile.backToMarketplace")}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Slider */}
            {displayImages.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted shadow-airbnb">
                  <Image
                    src={displayImages[currentImageIndex]}
                    alt={profile.full_name || "Worker"}
                    fill
                    className="object-cover"
                    priority
                  />
                  {displayImages.length > 1 && (
                    <>
                      <Button
                        onClick={prevImage}
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-lg hover:bg-background"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={nextImage}
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-lg hover:bg-background"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                      <Badge className="absolute bottom-4 right-4 bg-background/90 text-foreground hover:bg-background/90">
                        {currentImageIndex + 1} / {displayImages.length}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {displayImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {displayImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg transition-all ${
                          idx === currentImageIndex
                            ? "ring-2 ring-primary ring-offset-2"
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
            <Card className="shadow-airbnb">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold">
                      {profile.full_name || t("PublicProfile.unnamedWorker")}
                    </h1>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {profile.city && profile.district
                        ? `${profile.district}, ${profile.city}`
                        : profile.city || t("PublicProfile.locationNotSpecified")}
                      {profile.is_verified && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <ShieldCheck className="h-4 w-4" />
                            {t("PublicProfile.verified")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Basic Info Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {profile.age && (
                    <div className="text-center">
                      <div className="flex justify-center">
                        <CalendarIcon className="h-8 w-8 text-primary" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("PublicProfile.age")}
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.age} {t("PublicProfile.yearsOld")}
                      </p>
                    </div>
                  )}
                  {profile.height && (
                    <div className="text-center">
                      <div className="flex justify-center">
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("PublicProfile.height")}
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.height} cm
                      </p>
                    </div>
                  )}
                  {profile.weight && (
                    <div className="text-center">
                      <div className="flex justify-center">
                        <Weight className="h-8 w-8 text-primary" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("PublicProfile.weight")}
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.weight} kg
                      </p>
                    </div>
                  )}
                  {profile.zodiac_sign && (
                    <div className="text-center">
                      <div className="flex justify-center">
                        <Star className="h-8 w-8 text-primary" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("PublicProfile.zodiac")}
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.zodiac_sign}
                      </p>
                    </div>
                  )}
                </div>

                {/* Introduction */}
                {profile.introduction && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-bold mb-2">
                        {t("PublicProfile.introduction")}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {profile.introduction}
                      </p>
                    </div>
                  </>
                )}

                {/* Hobbies/Skills */}
                {profile.hobbies && profile.hobbies.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        {t("PublicProfile.hobbies")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.hobbies.map((hobby) => (
                          <Badge
                            key={hobby}
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        {t("PublicProfile.skills")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Lifestyle */}
                {profile.lifestyle && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {t("PublicProfile.lifestyle")}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {profile.lifestyle}
                      </p>
                    </div>
                  </>
                )}

                {/* Favorite Quote */}
                {profile.favorite_quote && (
                  <>
                    <Separator />
                    <div className="rounded-lg border-l-4 border-primary bg-muted p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {t("PublicProfile.favoriteQuote")}
                      </p>
                      <p className="italic text-foreground">
                        &ldquo;{profile.favorite_quote}&rdquo;
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <ReviewsSection
              reviews={reviews}
              averageRating={profile.rating || 0}
              totalReviews={profile.total_reviews || 0}
              ratingDistribution={ratingDist}
            />
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:sticky lg:top-4 lg:h-fit space-y-6">
            <Card className="shadow-airbnb">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    {t("PublicProfile.serviceProvided")}
                  </h3>
                  {profile.available && (
                    <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                      <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                      {t("PublicProfile.availableNow")}
                    </Badge>
                  )}
                </div>
                {profile.service_type && (
                  <p className="text-sm capitalize text-muted-foreground mt-1">
                    {profile.service_type === "assistance"
                      ? t("PublicProfile.assistance")
                      : t("PublicProfile.companionship")}{" "}
                    •{" "}
                    {(profile.service_categories && profile.service_categories.length > 0)
                      ? profile.service_categories.map(cat => cat.replace(/_/g, " ")).join(", ")
                      : profile.service_category
                      ? profile.service_category.replace(/_/g, " ")
                      : `Level ${profile.service_level}`}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Service Cards with Pricing - Slider if multiple services */}
                {(() => {
                  // Get services with pricing
                  const services = profile.service_categories && profile.service_categories.length > 0
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
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            {t("PublicProfile.pricing")}
                          </h4>
                          {hasMultipleServices && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentServiceIndex((prev) => Math.max(0, prev - 1))}
                                disabled={currentServiceIndex === 0}
                                className="h-8 w-8"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {currentServiceIndex + 1} / {services.length}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentServiceIndex((prev) => Math.min(services.length - 1, prev + 1))}
                                disabled={currentServiceIndex === services.length - 1}
                                className="h-8 w-8"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
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
                            {services.map((serviceCategory) => {
                              const pricing = servicePricing[serviceCategory] || {
                                hourly_rate: profile.hourly_rate || 0,
                                daily_rate: profile.daily_rate || 0,
                                monthly_rate: profile.monthly_rate || 0,
                                min_booking_hours: profile.min_booking_hours || 2,
                              };

                              return (
                                <div
                                  key={serviceCategory}
                                  className="w-full flex-shrink-0 space-y-3 px-1"
                                  style={{
                                    minWidth: "100%",
                                    maxWidth: "100%",
                                  }}
                                >
                                  {hasMultipleServices && (
                                    <p className="text-sm font-medium mb-2">
                                      {categoryNames[serviceCategory] || serviceCategory.replace(/_/g, " ")}
                                    </p>
                                  )}
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm">{t("PublicProfile.hourlyRate")}</span>
                                      </div>
                                      <p className="text-xl font-bold">
                                        {formatCurrency(pricing.hourly_rate, profile.currency)}
                                      </p>
                                    </div>
                                    {pricing.daily_rate > 0 && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <CalendarIcon className="h-4 w-4" />
                                          <span className="text-sm">{t("PublicProfile.dailyRate")}</span>
                                        </div>
                                        <p className="text-xl font-bold">
                                          {formatCurrency(pricing.daily_rate, profile.currency)}
                                        </p>
                                      </div>
                                    )}
                                    {pricing.monthly_rate > 0 && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <CalendarIcon className="h-4 w-4" />
                                          <span className="text-sm">{t("PublicProfile.monthlyRate")}</span>
                                        </div>
                                        <p className="text-xl font-bold">
                                          {formatCurrency(pricing.monthly_rate, profile.currency)}
                                        </p>
                                      </div>
                                    )}
                                    {pricing.min_booking_hours > 0 && (
                                      <p className="text-xs text-muted-foreground">
                                        {t("PublicProfile.minimumBookingHours").replace("{hours}", pricing.min_booking_hours.toString())}
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
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{t("PublicProfile.hourlyRate")}</span>
                              </div>
                              <p className="text-xl font-bold">
                                {formatCurrency(profile.hourly_rate, profile.currency)}
                              </p>
                            </div>
                            {profile.daily_rate && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span className="text-sm">{t("PublicProfile.dailyRate")}</span>
                                </div>
                                <p className="text-xl font-bold">
                                  {formatCurrency(profile.daily_rate, profile.currency)}
                                </p>
                              </div>
                            )}
                            {profile.monthly_rate && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span className="text-sm">{t("PublicProfile.monthlyRate")}</span>
                                </div>
                                <p className="text-xl font-bold">
                                  {formatCurrency(profile.monthly_rate, profile.currency)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Additional Info */}
                <Separator />
                <div className="space-y-3">
                  {profile.experience_years !== undefined &&
                    profile.experience_years > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {t("PublicProfile.experience")}:{" "}
                          <strong className="text-foreground">{profile.experience_years}+ {t("PublicProfile.years")}</strong>
                        </span>
                      </div>
                    )}
                  {profile.min_booking_hours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {t("PublicProfile.responseTime")}:{" "}
                        <strong className="text-foreground">{t("PublicProfile.withinHours").replace("{hours}", profile.min_booking_hours.toString())}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Book Button */}
                <Button className="w-full h-12 gap-2" size="lg">
                  <CalendarIcon className="h-5 w-5" />
                  {t("PublicProfile.bookService")}
                </Button>

                {/* Contact */}
                <Button variant="outline" className="w-full h-12 gap-2" size="lg">
                  <MessageCircle className="h-5 w-5" />
                  {t("PublicProfile.sendMessage")}
                </Button>
              </CardContent>
            </Card>

            {/* Availability Calendar */}
            <AvailabilityCalendar workerId={workerId} isEditable={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
