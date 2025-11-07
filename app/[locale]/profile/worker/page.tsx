"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUser, User, updateCurrentUserProfile } from "@/lib/users";
import {
  getCurrentWorkerProfile,
  updateCurrentWorkerProfile,
  WorkerProfile,
  calculateProfileCompletion,
  formatHourlyRate,
  formatRating,
} from "@/lib/profiles";
import { useT } from "@/i18n/provider";
import AvatarUpload from "@/components/AvatarUpload";

export default function WorkerProfilePage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const t = useT();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    bio: "",
    skills: [] as string[],
    experience_years: 0,
    hourly_rate: "",
    address: "",
    city: "",
    district: "",
    available: true,
    available_from: "",
    available_to: "",
    working_days: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
    facebook_url: "",
    linkedin_url: "",
    website_url: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newCertification, setNewCertification] = useState("");

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

      // Check if user is a worker
      if (userData.role !== "worker") {
        router.push("/profile/employer");
        return;
      }

      setUser(userData);

      // Get worker profile
      const profileData = await getCurrentWorkerProfile();
      if (profileData) {
        setProfile(profileData);
        // Initialize form with profile data
        setFormData({
          bio: profileData.bio || "",
          skills: profileData.skills || [],
          experience_years: profileData.experience_years || 0,
          hourly_rate: profileData.hourly_rate?.toString() || "",
          address: profileData.address || "",
          city: profileData.city || "",
          district: profileData.district || "",
          available: profileData.available,
          available_from: profileData.available_from || "",
          available_to: profileData.available_to || "",
          working_days: profileData.working_days || [],
          certifications: profileData.certifications || [],
          languages: profileData.languages || ["vi"],
          facebook_url: profileData.facebook_url || "",
          linkedin_url: profileData.linkedin_url || "",
          website_url: profileData.website_url || "",
        });
      }
    } catch (err) {
      console.error("Error checking auth:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const updates = {
        bio: formData.bio || null,
        skills: formData.skills.length > 0 ? formData.skills : null,
        experience_years: formData.experience_years,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        address: formData.address || null,
        city: formData.city || null,
        district: formData.district || null,
        available: formData.available,
        available_from: formData.available_from || null,
        available_to: formData.available_to || null,
        working_days: formData.working_days,
        certifications: formData.certifications.length > 0 ? formData.certifications : null,
        languages: formData.languages,
        facebook_url: formData.facebook_url || null,
        linkedin_url: formData.linkedin_url || null,
        website_url: formData.website_url || null,
      };

      const updatedProfile = await updateCurrentWorkerProfile(updates);

      if (updatedProfile) {
        setProfile(updatedProfile);
        setMessage(t("Profile.updateSuccess"));
        setIsEditMode(false);
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

  function addSkill() {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  }

  function removeSkill(skill: string) {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  }

  function addCertification() {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      });
      setNewCertification("");
    }
  }

  function removeCertification(cert: string) {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== cert),
    });
  }

  function toggleWorkingDay(day: string) {
    if (formData.working_days.includes(day)) {
      setFormData({
        ...formData,
        working_days: formData.working_days.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        working_days: [...formData.working_days, day],
      });
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

  const completion = calculateProfileCompletion(profile, "worker");

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
                  {user.full_name || user.email}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{t("Profile.workerProfile")}</p>
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
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                  value={user.phone || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.bio")}
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditMode}
                  rows={4}
                  placeholder={t("Profile.bioPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.skills")}
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{skill}</span>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditMode && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder={t("Profile.skillsPlaceholder")}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {t("Profile.addSkill")}
                </button>
              </div>
            )}
          </div>

          {/* Experience & Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.experience")} & {t("Profile.pricing")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.experienceYears")}
                </label>
                <input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) =>
                    setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })
                  }
                  disabled={!isEditMode}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.hourlyRate")} ({t("Profile.currency")})
                </label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  disabled={!isEditMode}
                  min="0"
                  step="1000"
                  placeholder={t("Profile.hourlyRatePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
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

          {/* Availability */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.availability")}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  disabled={!isEditMode}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("Profile.available")}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Profile.from")}
                  </label>
                  <input
                    type="time"
                    value={formData.available_from}
                    onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                    disabled={!isEditMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Profile.to")}
                  </label>
                  <input
                    type="time"
                    value={formData.available_to}
                    onChange={(e) => setFormData({ ...formData, available_to: e.target.value })}
                    disabled={!isEditMode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("Profile.workingDays")}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => isEditMode && toggleWorkingDay(day)}
                      disabled={!isEditMode}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        formData.working_days.includes(day)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      } ${
                        isEditMode ? "hover:opacity-80 cursor-pointer" : "cursor-default"
                      } disabled:opacity-50`}
                    >
                      {t(`Profile.${day === "mon" ? "monday" : day === "tue" ? "tuesday" : day === "wed" ? "wednesday" : day === "thu" ? "thursday" : day === "fri" ? "friday" : day === "sat" ? "saturday" : "sunday"}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.certifications")}
            </h2>

            <div className="space-y-2 mb-4">
              {formData.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-white">{cert}</span>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditMode && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCertification();
                    }
                  }}
                  placeholder={t("Profile.certificationsPlaceholder")}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {t("Profile.addCertification")}
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.stats")}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{profile.total_jobs}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("Profile.totalJobs")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{profile.completed_jobs}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("Profile.completedJobs")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {formatRating(profile.rating)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("Profile.rating")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{profile.total_reviews}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("Profile.reviews")}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("Profile.socialLinks")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.facebook")}
                </label>
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  disabled={!isEditMode}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.linkedin")}
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  disabled={!isEditMode}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("Profile.website")}
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

          {/* Save Button */}
          {isEditMode && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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

