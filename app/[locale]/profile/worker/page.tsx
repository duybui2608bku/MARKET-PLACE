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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Eye,
  Edit,
  Briefcase,
  CheckCircle,
  Star,
  MessageSquare,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";

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
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-16">
        <p className="text-muted-foreground">{t("WorkerProfile.profileNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Actions */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t("WorkerProfile.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("WorkerProfile.subtitle")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/worker/${user.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                {t("WorkerProfile.viewPublicProfile")}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/${locale}/worker-onboarding`}>
                <Edit className="mr-2 h-4 w-4" />
                {t("WorkerProfile.editFullProfile")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("WorkerProfile.totalJobs")}
              </CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile.total_jobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("WorkerProfile.completed")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile.completed_jobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("WorkerProfile.rating")}
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">
                  {formatRating(profile.rating)}
                </div>
                {renderStars(profile.rating)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("WorkerProfile.reviews")}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile.total_reviews}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 border-4">
                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name || "Worker"} />
                    <AvatarFallback className="text-2xl">
                      {user.full_name?.[0]?.toUpperCase() || "W"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {user.full_name || t("WorkerProfile.unnamedWorker")}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {profile.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profile.city}
                        </span>
                      )}
                      {profile.experience_years > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {profile.experience_years}+ {t("WorkerProfile.yearsExperience")}
                          </span>
                        </>
                      )}
                      {profile.is_verified && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-green-600">
                            <Shield className="h-4 w-4" />
                            {t("WorkerProfile.verified")}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge
                        variant={profile.available ? "default" : "secondary"}
                        className="gap-1"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            profile.available ? "bg-green-400" : "bg-muted-foreground"
                          }`}
                        />
                        {profile.available
                          ? t("WorkerProfile.available")
                          : t("WorkerProfile.unavailable")}
                      </Badge>
                      {profile.service_type && (
                        <Badge variant="outline" className="capitalize">
                          {profile.service_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            {(profile.age || profile.height || profile.weight || profile.zodiac_sign) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("WorkerProfile.personalInformation")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {profile.age && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">{profile.age}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("WorkerProfile.age")}
                        </p>
                      </div>
                    )}
                    {profile.height && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">{profile.height}cm</p>
                        <p className="text-sm text-muted-foreground">
                          {t("WorkerProfile.height")}
                        </p>
                      </div>
                    )}
                    {profile.weight && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">{profile.weight}kg</p>
                        <p className="text-sm text-muted-foreground">
                          {t("WorkerProfile.weight")}
                        </p>
                      </div>
                    )}
                    {profile.zodiac_sign && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">{profile.zodiac_sign}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("WorkerProfile.zodiac")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {profile.gallery_images && profile.gallery_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("WorkerProfile.gallery")} ({profile.gallery_images.length}{" "}
                    {t("WorkerProfile.photos")})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {profile.gallery_images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square overflow-hidden rounded-lg"
                      >
                        <Image
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Introduction & Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t("WorkerProfile.aboutMe")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.introduction && (
                  <p className="text-foreground">{profile.introduction}</p>
                )}
                {profile.bio && (
                  <div>
                    <h4 className="mb-2 font-medium">
                      {t("WorkerProfile.experience")}
                    </h4>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                )}
                {profile.lifestyle && (
                  <div>
                    <h4 className="mb-2 font-medium">
                      {t("WorkerProfile.lifestyle")}
                    </h4>
                    <p className="text-sm text-muted-foreground">{profile.lifestyle}</p>
                  </div>
                )}
                {profile.favorite_quote && (
                  <>
                    <Separator />
                    <div className="rounded-lg border-l-4 border-primary bg-muted p-4">
                      <p className="text-sm italic">"{profile.favorite_quote}"</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Skills & Hobbies */}
            {((profile.skills && profile.skills.length > 0) ||
              (profile.hobbies && profile.hobbies.length > 0)) && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <h4 className="mb-3 font-semibold">
                        {t("WorkerProfile.skills")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <Badge key={skill} variant="default">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.hobbies && profile.hobbies.length > 0 && (
                    <div>
                      <h4 className="mb-3 font-semibold">
                        {t("WorkerProfile.hobbies")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.hobbies.map((hobby) => (
                          <Badge key={hobby} variant="secondary">
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            {(() => {
              const services =
                profile.service_categories && profile.service_categories.length > 0
                  ? profile.service_categories
                  : profile.service_category
                  ? [profile.service_category]
                  : [];

              const servicePricing = profile.service_pricing || {};
              const hasServices = services.length > 0 || profile.hourly_rate;

              if (!hasServices) return null;

              const categoryNames: Record<string, string> = {
                personal_assist: "Hỗ Trợ Cá Nhân",
                professional_onsite_assist: "Hỗ Trợ Chuyên Nghiệp",
                virtual_assist: "Hỗ Trợ Từ Xa",
                tour_guide: "Hướng Dẫn Viên",
                translator: "Phiên Dịch",
              };

              return (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("WorkerProfile.pricing")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {services.length > 0
                      ? services.map((serviceCategory) => {
                          const pricing = servicePricing[serviceCategory] || {
                            hourly_rate: profile.hourly_rate || 0,
                            daily_rate: profile.daily_rate || 0,
                            monthly_rate: profile.monthly_rate || 0,
                            min_booking_hours: profile.min_booking_hours || 2,
                          };

                          return (
                            <div
                              key={serviceCategory}
                              className="rounded-lg border bg-muted p-4"
                            >
                              <h4 className="mb-3 text-base font-semibold">
                                {categoryNames[serviceCategory] ||
                                  serviceCategory.replace(/_/g, " ")}
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    {t("WorkerProfile.hourly")}:
                                  </span>
                                  <span className="text-base font-semibold">
                                    {formatCurrency(
                                      pricing.hourly_rate,
                                      profile.currency
                                    )}
                                  </span>
                                </div>
                                {pricing.daily_rate > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      {t("WorkerProfile.daily")}:
                                    </span>
                                    <span className="text-base font-semibold">
                                      {formatCurrency(
                                        pricing.daily_rate,
                                        profile.currency
                                      )}
                                    </span>
                                  </div>
                                )}
                                {pricing.monthly_rate > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      {t("WorkerProfile.monthly")}:
                                    </span>
                                    <span className="text-base font-semibold">
                                      {formatCurrency(
                                        pricing.monthly_rate,
                                        profile.currency
                                      )}
                                    </span>
                                  </div>
                                )}
                                {pricing.min_booking_hours > 0 && (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {t("WorkerProfile.minimumBookingHours").replace(
                                      "{hours}",
                                      pricing.min_booking_hours.toString()
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      : profile.hourly_rate && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {t("WorkerProfile.hourly")}
                              </span>
                              <span className="text-lg font-bold">
                                {formatCurrency(profile.hourly_rate, profile.currency)}
                              </span>
                            </div>
                            {profile.daily_rate && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  {t("WorkerProfile.daily")}
                                </span>
                                <span className="text-lg font-bold">
                                  {formatCurrency(profile.daily_rate, profile.currency)}
                                </span>
                              </div>
                            )}
                            {profile.monthly_rate && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  {t("WorkerProfile.monthly")}
                                </span>
                                <span className="text-lg font-bold">
                                  {formatCurrency(profile.monthly_rate, profile.currency)}
                                </span>
                              </div>
                            )}
                            {profile.min_booking_hours && (
                              <p className="mt-4 text-xs text-muted-foreground">
                                {t("WorkerProfile.minimumBookingHours").replace(
                                  "{hours}",
                                  profile.min_booking_hours.toString()
                                )}
                              </p>
                            )}
                          </div>
                        )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Service Info */}
            {profile.service_type && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("WorkerProfile.service")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("WorkerProfile.type")}:
                    </span>
                    <span className="font-medium capitalize">
                      {profile.service_type}
                    </span>
                  </div>
                  {profile.service_categories &&
                    profile.service_categories.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("WorkerProfile.category")}:
                        </span>
                        <span className="font-medium">
                          {profile.service_categories
                            .map((cat) => cat.replace(/_/g, " "))
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  {(!profile.service_categories ||
                    profile.service_categories.length === 0) &&
                    profile.service_category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("WorkerProfile.category")}:
                        </span>
                        <span className="font-medium">
                          {profile.service_category.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}
                  {profile.service_level && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("WorkerProfile.level")}:
                      </span>
                      <span className="font-medium">Level {profile.service_level}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t("WorkerProfile.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href={`/${locale}/worker-onboarding`}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("WorkerProfile.editProfile")}
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href={`/${locale}/worker/${user.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t("WorkerProfile.viewPublicProfile")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Availability Calendar */}
            <AvailabilityCalendar workerId={user.id} isEditable={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
