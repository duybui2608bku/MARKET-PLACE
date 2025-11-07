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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const completion = calculateProfileCompletion(profile, "employer");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formData.company_name || user.full_name || user.email}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{t("Profile.employerProfile")}</p>
                <div className="flex items-center mt-2 space-x-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      profile.is_verified
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {profile.is_verified ? t("Profile.verified") : t("Profile.notVerified")}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("Profile.completion")}: {completion}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              {!isEditMode ? (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {t("Profile.edit")}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setError(null);
                    setMessage(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  {t("Profile.cancel")}
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.basicInfo")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.fullName")}
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditMode}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.email")}
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.phone")}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditMode}
                  placeholder="+84..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.companyInfo")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.companyName")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  disabled={!isEditMode}
                  placeholder={t("Profile.companyNamePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.companyDescription")}
                </label>
                <textarea
                  value={formData.company_description}
                  onChange={(e) =>
                    setFormData({ ...formData, company_description: e.target.value })
                  }
                  disabled={!isEditMode}
                  rows={4}
                  placeholder={t("Profile.companyDescriptionPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Profile.industry")}
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    disabled={!isEditMode}
                    placeholder={t("Profile.industryPlaceholder")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Profile.companySize")}
                  </label>
                  <select
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    disabled={!isEditMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  >
                    <option value="">Select size...</option>
                    <option value="small">{t("Profile.companySize_small")}</option>
                    <option value="medium">{t("Profile.companySize_medium")}</option>
                    <option value="large">{t("Profile.companySize_large")}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.location")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.address")}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditMode}
                  placeholder={t("Profile.addressPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Profile.city")}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditMode}
                    placeholder={t("Profile.cityPlaceholder")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Profile.district")}
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    disabled={!isEditMode}
                    placeholder={t("Profile.districtPlaceholder")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.companyContact")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.companyPhone")}
                </label>
                <input
                  type="text"
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  disabled={!isEditMode}
                  placeholder="+84..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.companyEmail")}
                </label>
                <input
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                  disabled={!isEditMode}
                  placeholder="company@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.companyWebsite")}
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  disabled={!isEditMode}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.verification")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.taxCode")}
                </label>
                <input
                  type="text"
                  value={formData.tax_code}
                  onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                  disabled={!isEditMode}
                  placeholder={t("Profile.taxCodePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              {profile.business_license && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Profile.businessLicense")}
                  </label>
                  <a
                    href={profile.business_license}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View License
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.companyStats")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {profile.total_jobs_posted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t("Profile.totalJobsPosted")}
                </div>
              </div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {profile.total_hires}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t("Profile.totalHires")}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditMode && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? t("Profile.saving") : t("Profile.save")}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

