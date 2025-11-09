"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUser, User, updateCurrentUserProfile } from "@/lib/users";
import {
  getCurrentEmployerProfile,
  updateCurrentEmployerProfile,
  EmployerProfile,
  calculateProfileCompletion,
} from "@/lib/profiles";
import { useT } from "@/i18n/provider";
import AvatarUpload from "@/components/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Briefcase,
  Users,
  ShieldCheck,
  Edit,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function EmployerProfilePage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const t = useT();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    company_name: "",
    company_description: "",
    industry: "",
    company_size: "",
    address: "",
    city: "",
    district: "",
    company_phone: "",
    company_email: "",
    website_url: "",
    tax_code: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Get user data
      const userData = await getCurrentUser();
      if (!userData) {
        router.push("/login");
        return;
      }

      // Check if user is an employer
      if (userData.role !== "employer") {
        router.push("/profile/worker");
        return;
      }

      setUser(userData);

      // Get employer profile
      const profileData = await getCurrentEmployerProfile();
      if (profileData) {
        setProfile(profileData);
        // Initialize form with profile data
        setFormData({
          full_name: userData.full_name || "",
          phone: userData.phone || "",
          company_name: profileData.company_name || "",
          company_description: profileData.company_description || "",
          industry: profileData.industry || "",
          company_size: profileData.company_size || "",
          address: profileData.address || "",
          city: profileData.city || "",
          district: profileData.district || "",
          company_phone: profileData.company_phone || "",
          company_email: profileData.company_email || "",
          website_url: profileData.website_url || "",
          tax_code: profileData.tax_code || "",
        });
      }
    } catch (err) {
      console.error("Error checking auth:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(avatarUrl: string) {
    try {
      const updated = await updateCurrentUserProfile({ avatar_url: avatarUrl });
      if (updated) {
        setUser(updated);
        setMessage("Avatar updated successfully!");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error updating avatar:", err);
      setError("Failed to update avatar");
    }
  }

  function handleAvatarError(errorMsg: string) {
    setError(errorMsg);
    setTimeout(() => setError(null), 5000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      // Update user basic info
      await updateCurrentUserProfile({
        full_name: formData.full_name || null,
        phone: formData.phone || null,
      });

      // Update employer profile
      const updates = {
        company_name: formData.company_name || null,
        company_description: formData.company_description || null,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        address: formData.address || null,
        city: formData.city || null,
        district: formData.district || null,
        company_phone: formData.company_phone || null,
        company_email: formData.company_email || null,
        website_url: formData.website_url || null,
        tax_code: formData.tax_code || null,
      };

      const updatedProfile = await updateCurrentEmployerProfile(updates);

      if (updatedProfile) {
        setProfile(updatedProfile);
        setMessage(t("Profile.updateSuccess"));
        setIsEditMode(false);

        // Refresh user data
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } else {
        setError(t("Profile.updateError"));
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(t("Profile.updateError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <p className="text-destructive">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const completion = calculateProfileCompletion(profile, "employer");

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-airbnb">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-6 flex-1">
                <AvatarUpload
                  currentAvatarUrl={user.avatar_url}
                  onUploadComplete={handleAvatarUpload}
                  onUploadError={handleAvatarError}
                  size="lg"
                />
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {formData.company_name || user.full_name || user.email}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {t("Profile.employerProfile")}
                  </CardDescription>
                  <div className="flex items-center mt-3 gap-3">
                    <Badge variant={profile.is_verified ? "secondary" : "outline"} className={profile.is_verified ? "gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" : ""}>
                      {profile.is_verified && <ShieldCheck className="h-3 w-3" />}
                      {profile.is_verified ? t("Profile.verified") : t("Profile.notVerified")}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {t("Profile.completion")}: {completion}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {!isEditMode ? (
                  <Button onClick={() => setIsEditMode(true)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    {t("Profile.edit")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditMode(false);
                      setError(null);
                      setMessage(null);
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    {t("Profile.cancel")}
                  </Button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        {message && (
          <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="shadow-airbnb">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t("Profile.basicInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("Profile.fullName")}</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditMode}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("Profile.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("Profile.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="+84..."
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card className="shadow-airbnb">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                {t("Profile.companyInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  {t("Profile.companyName")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  disabled={!isEditMode}
                  placeholder={t("Profile.companyNamePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_description">{t("Profile.companyDescription")}</Label>
                <Textarea
                  id="company_description"
                  value={formData.company_description}
                  onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                  disabled={!isEditMode}
                  rows={4}
                  placeholder={t("Profile.companyDescriptionPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">{t("Profile.industry")}</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="industry"
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      disabled={!isEditMode}
                      placeholder={t("Profile.industryPlaceholder")}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_size">{t("Profile.companySize")}</Label>
                  <Select
                    value={formData.company_size}
                    onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                    disabled={!isEditMode}
                  >
                    <SelectTrigger id="company_size">
                      <SelectValue placeholder="Select size..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">{t("Profile.companySize_small")}</SelectItem>
                      <SelectItem value="medium">{t("Profile.companySize_medium")}</SelectItem>
                      <SelectItem value="large">{t("Profile.companySize_large")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="shadow-airbnb">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t("Profile.location")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">{t("Profile.address")}</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditMode}
                  placeholder={t("Profile.addressPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("Profile.city")}</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditMode}
                    placeholder={t("Profile.cityPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">{t("Profile.district")}</Label>
                  <Input
                    id="district"
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    disabled={!isEditMode}
                    placeholder={t("Profile.districtPlaceholder")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Contact */}
          <Card className="shadow-airbnb">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {t("Profile.companyContact")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_phone">{t("Profile.companyPhone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company_phone"
                    type="text"
                    value={formData.company_phone}
                    onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="+84..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_email">{t("Profile.companyEmail")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company_email"
                    type="email"
                    value={formData.company_email}
                    onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="company@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">{t("Profile.companyWebsite")}</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="https://..."
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification */}
          <Card className="shadow-airbnb">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {t("Profile.verification")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tax_code">{t("Profile.taxCode")}</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tax_code"
                    type="text"
                    value={formData.tax_code}
                    onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                    disabled={!isEditMode}
                    placeholder={t("Profile.taxCodePlaceholder")}
                    className="pl-10"
                  />
                </div>
              </div>

              {profile.business_license && (
                <div className="space-y-2">
                  <Label>{t("Profile.businessLicense")}</Label>
                  <Button variant="link" className="h-auto p-0" asChild>
                    <a
                      href={profile.business_license}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View License
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="shadow-airbnb">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {t("Profile.companyStats")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-primary/10 rounded-lg">
                  <div className="text-4xl font-bold text-primary">
                    {profile.total_jobs_posted}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {t("Profile.totalJobsPosted")}
                  </div>
                </div>
                <div className="text-center p-6 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {profile.total_hires}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {t("Profile.totalHires")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditMode && (
            <Card className="shadow-airbnb">
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 gap-2"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("Profile.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t("Profile.save")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
