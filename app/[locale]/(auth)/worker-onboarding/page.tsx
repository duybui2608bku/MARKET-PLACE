"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useT, useLocale } from "@/i18n/provider";
import AvatarUpload from "@/components/AvatarUpload";
import MultiImageUpload from "@/components/MultiImageUpload";

type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

type ServiceType = "assistance" | "companionship";

type AssistanceCategory =
  | "personal_assist"
  | "professional_onsite_assist"
  | "virtual_assist"
  | "tour_guide"
  | "translator";

type CompanionshipLevel = 1 | 2 | 3;

interface Step1Data {
  full_name: string;
  age: number | "";
  height: number | "";
  weight: number | "";
  zodiac_sign: ZodiacSign | "";
  hobbies: string[];
  lifestyle: string;
  favorite_quote: string;
  introduction: string;
  skills: string[];
  experience: string;
  available: boolean;
}

interface Step2Data {
  gallery_images: string[];
  service_type: ServiceType | "";
  service_categories: AssistanceCategory[]; // Changed to array for multiple selections
  service_level: CompanionshipLevel | "";
  service_languages: string[];
}

interface ServicePricing {
  hourly_rate: string;
  daily_rate: string;
  monthly_rate: string;
  min_booking_hours: number;
}

interface Step3Data {
  currency: "USD" | "VND" | "EUR" | "JPY" | "KRW" | "CNY";
  service_pricing: Record<string, ServicePricing>; // Pricing for each service category
  service_images: string[];
  // Legacy fields for backward compatibility
  hourly_rate: string;
  min_booking_hours: number;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const CURRENCIES = [
  { code: "USD", name: "USD - US Dollar", symbol: "$" },
  { code: "VND", name: "VND - Vietnamese Dong", symbol: "₫" },
  { code: "EUR", name: "EUR - Euro", symbol: "€" },
  { code: "JPY", name: "JPY - Japanese Yen", symbol: "¥" },
  { code: "KRW", name: "KRW - Korean Won", symbol: "₩" },
  { code: "CNY", name: "CNY - Chinese Yuan", symbol: "¥" },
];

export default function WorkerOnboardingPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const t = useT();
  const locale = useLocale();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1 state
  const [step1Data, setStep1Data] = useState<Step1Data>({
    full_name: "",
    age: "",
    height: "",
    weight: "",
    zodiac_sign: "",
    hobbies: [],
    lifestyle: "",
    favorite_quote: "",
    introduction: "",
    skills: [],
    experience: "",
    available: true,
  });

  const [newHobby, setNewHobby] = useState("");
  const [newSkill, setNewSkill] = useState("");

  // Step 2 state
  const [step2Data, setStep2Data] = useState<Step2Data>({
    gallery_images: [],
    service_type: "",
    service_categories: [], // Changed to array
    service_level: "",
    service_languages: [],
  });

  const [newLanguage, setNewLanguage] = useState("");

  // Step 3 state
  const [step3Data, setStep3Data] = useState<Step3Data>({
    currency: "USD",
    service_pricing: {}, // Pricing for each service category
    service_images: [],
    // Legacy fields
    hourly_rate: "",
    min_booking_hours: 2,
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
        router.push(`/${locale}/login`);
        return;
      }

      setUserId(session.user.id);

      // Check if user is a worker
      const { data: userData } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", session.user.id)
        .single();

      if (!userData || userData.role !== "worker") {
        router.push(`/${locale}`);
        return;
      }

      // Get full worker profile data
      const { data: profileData } = await supabase
        .from("worker_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        // Load existing data into forms (for editing)
        setStep1Data({
          full_name: userData.full_name || "",
          age: profileData.age || "",
          height: profileData.height || "",
          weight: profileData.weight || "",
          zodiac_sign: profileData.zodiac_sign || "",
          hobbies: profileData.hobbies || [],
          lifestyle: profileData.lifestyle || "",
          favorite_quote: profileData.favorite_quote || "",
          introduction: profileData.introduction || "",
          skills: profileData.skills || [],
          experience: profileData.bio || "",
          available: profileData.available ?? true,
        });

        setStep2Data({
          gallery_images: profileData.gallery_images || [],
          service_type: profileData.service_type || "",
          service_categories: profileData.service_categories || 
            (profileData.service_category ? [profileData.service_category] : []), // Migrate old data
          service_level: profileData.service_level || "",
          service_languages: profileData.service_languages || [],
        });

        // Load service_pricing from JSONB or migrate from legacy fields
        let servicePricing: Record<string, ServicePricing> = {};
        if (profileData.service_pricing && typeof profileData.service_pricing === 'object') {
          servicePricing = profileData.service_pricing as Record<string, ServicePricing>;
        } else if (profileData.service_category && profileData.hourly_rate) {
          // Migrate legacy pricing
          const hourly = profileData.hourly_rate;
          servicePricing[profileData.service_category] = {
            hourly_rate: hourly.toString(),
            daily_rate: (hourly * 8).toString(),
            monthly_rate: (hourly * 160).toString(),
            min_booking_hours: profileData.min_booking_hours || 2,
          };
        }

        setStep3Data({
          currency: profileData.currency || "USD",
          service_pricing: servicePricing,
          service_images: profileData.service_images || [],
          // Legacy fields
          hourly_rate: profileData.hourly_rate?.toString() || "",
          min_booking_hours: profileData.min_booking_hours || 2,
        });

        // Set current step
        if (profileData.setup_step && !profileData.setup_completed) {
          setCurrentStep(profileData.setup_step);
        } else if (profileData.setup_completed) {
          // Allow editing - start from step 1
          setCurrentStep(1);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Auth error:", err);
      router.push(`/${locale}/login`);
    }
  }

  // Step 1 handlers
  const addHobby = () => {
    if (newHobby.trim() && !step1Data.hobbies.includes(newHobby.trim())) {
      setStep1Data({
        ...step1Data,
        hobbies: [...step1Data.hobbies, newHobby.trim()],
      });
      setNewHobby("");
    }
  };

  const removeHobby = (hobby: string) => {
    setStep1Data({
      ...step1Data,
      hobbies: step1Data.hobbies.filter((h) => h !== hobby),
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !step1Data.skills.includes(newSkill.trim())) {
      setStep1Data({
        ...step1Data,
        skills: [...step1Data.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setStep1Data({
      ...step1Data,
      skills: step1Data.skills.filter((s) => s !== skill),
    });
  };

  const handleStep1Submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!userId) return;

      // Update user full_name
      const { error: userError } = await supabase
        .from("users")
        .update({ full_name: step1Data.full_name })
        .eq("id", userId);

      if (userError) throw userError;

      // Update worker profile
      const { error: profileError } = await supabase
        .from("worker_profiles")
        .update({
          age: step1Data.age || null,
          height: step1Data.height || null,
          weight: step1Data.weight || null,
          zodiac_sign: step1Data.zodiac_sign || null,
          hobbies: step1Data.hobbies,
          lifestyle: step1Data.lifestyle || null,
          favorite_quote: step1Data.favorite_quote || null,
          introduction: step1Data.introduction || null,
          skills: step1Data.skills,
          bio: step1Data.experience || null,
          available: step1Data.available,
          setup_step: 2,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      setCurrentStep(2);
    } catch (err: any) {
      console.error("Error saving step 1:", err);
      setError(err.message || "Failed to save profile information");
    } finally {
      setSaving(false);
    }
  };

  // Step 2 handlers
  const addLanguage = () => {
    if (
      newLanguage.trim() &&
      !step2Data.service_languages.includes(newLanguage.trim())
    ) {
      setStep2Data({
        ...step2Data,
        service_languages: [...step2Data.service_languages, newLanguage.trim()],
      });
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    setStep2Data({
      ...step2Data,
      service_languages: step2Data.service_languages.filter((l) => l !== lang),
    });
  };

  const handleStep2Submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (step2Data.gallery_images.length < 3) {
      setError("Please upload at least 3 gallery images");
      return;
    }

    if (!step2Data.service_type) {
      setError("Please select a service type");
      return;
    }

    if (
      step2Data.service_type === "assistance" &&
      step2Data.service_categories.length === 0
    ) {
      setError("Please select at least one service category");
      return;
    }

    if (
      step2Data.service_type === "companionship" &&
      !step2Data.service_level
    ) {
      setError("Please select a service level");
      return;
    }

    setSaving(true);

    try {
      if (!userId) return;

      const { error: profileError } = await supabase
        .from("worker_profiles")
        .update({
          gallery_images: step2Data.gallery_images,
          service_type: step2Data.service_type,
          service_categories:
            step2Data.service_type === "assistance"
              ? step2Data.service_categories
              : [],
          service_level:
            step2Data.service_type === "companionship"
              ? step2Data.service_level
              : null,
          service_languages:
            step2Data.service_categories.includes("translator")
              ? step2Data.service_languages
              : [],
          setup_step: 3,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      setCurrentStep(3);
    } catch (err: any) {
      console.error("Error saving step 2:", err);
      setError(err.message || "Failed to save service information");
    } finally {
      setSaving(false);
    }
  };

  // Step 3 handlers
  const calculateDailyRate = (hourlyRate: string) => {
    const hourly = parseFloat(hourlyRate);
    if (isNaN(hourly)) return "0.00";
    return (hourly * 8).toFixed(2);
  };

  const calculateMonthlyRate = (hourlyRate: string) => {
    const hourly = parseFloat(hourlyRate);
    if (isNaN(hourly)) return "0.00";
    return (hourly * 160).toFixed(2);
  };

  const updateServicePricing = (
    serviceCategory: string,
    field: keyof ServicePricing,
    value: string | number
  ) => {
    setStep3Data({
      ...step3Data,
      service_pricing: {
        ...step3Data.service_pricing,
        [serviceCategory]: {
          ...(step3Data.service_pricing[serviceCategory] || {
            hourly_rate: "",
            daily_rate: "",
            monthly_rate: "",
            min_booking_hours: 2,
          }),
          [field]: value,
          // Auto-calculate daily and monthly when hourly_rate changes
          ...(field === "hourly_rate" && typeof value === "string"
            ? {
                daily_rate: calculateDailyRate(value),
                monthly_rate: calculateMonthlyRate(value),
              }
            : {}),
        },
      },
    });
  };

  const handleStep3Submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that all selected services have pricing
    if (step2Data.service_type === "assistance" && step2Data.service_categories.length > 0) {
      for (const category of step2Data.service_categories) {
        const pricing = step3Data.service_pricing[category];
        if (!pricing || !pricing.hourly_rate || parseFloat(pricing.hourly_rate) <= 0) {
          setError(`Please enter pricing for ${category.replace(/_/g, " ")}`);
          return;
        }
      }
    } else if (step2Data.service_type === "companionship") {
      // For companionship, use legacy hourly_rate if no service_pricing
      if (!step3Data.hourly_rate || parseFloat(step3Data.hourly_rate) <= 0) {
        setError("Please enter a valid hourly rate");
        return;
      }
    }

    setSaving(true);

    try {
      if (!userId) return;

      // Build service_pricing JSONB object
      const servicePricingJson: Record<string, any> = {};
      if (step2Data.service_type === "assistance" && step2Data.service_categories.length > 0) {
        for (const category of step2Data.service_categories) {
          const pricing = step3Data.service_pricing[category];
          if (pricing) {
            servicePricingJson[category] = {
              hourly_rate: parseFloat(pricing.hourly_rate),
              daily_rate: parseFloat(pricing.daily_rate),
              monthly_rate: parseFloat(pricing.monthly_rate),
              min_booking_hours: pricing.min_booking_hours,
            };
          }
        }
      }

      // For backward compatibility, also set hourly_rate to the first service's rate
      // or use legacy hourly_rate for companionship
      let legacyHourlyRate = null;
      if (step2Data.service_type === "assistance" && step2Data.service_categories.length > 0) {
        const firstCategory = step2Data.service_categories[0];
        const firstPricing = step3Data.service_pricing[firstCategory];
        if (firstPricing) {
          legacyHourlyRate = parseFloat(firstPricing.hourly_rate);
        }
      } else if (step2Data.service_type === "companionship") {
        legacyHourlyRate = parseFloat(step3Data.hourly_rate);
      }

      const { error: profileError } = await supabase
        .from("worker_profiles")
        .update({
          currency: step3Data.currency,
          service_pricing: servicePricingJson,
          hourly_rate: legacyHourlyRate, // Keep for backward compatibility
          min_booking_hours: step2Data.service_type === "assistance" && step2Data.service_categories.length > 0
            ? step3Data.service_pricing[step2Data.service_categories[0]]?.min_booking_hours || 2
            : step3Data.min_booking_hours,
          service_images: step3Data.service_images,
          setup_step: 4,
          setup_completed: true,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Redirect to worker profile
      router.push(`/${locale}/profile/worker`);
    } catch (err: any) {
      console.error("Error saving step 3:", err);
      setError(err.message || "Failed to save pricing information");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-1 items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                    currentStep >= step
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 flex-1 ${
                      currentStep > step
                        ? "bg-blue-600 dark:bg-blue-500"
                        : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>Personal Info</span>
            <span>Service</span>
            <span>Rates</span>
          </div>
          <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-500">
            Step {currentStep} of 3 • {Math.round((currentStep / 3) * 100)}%
            Complete
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-lg dark:border-white/15 dark:bg-zinc-950">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Chi Tiết Cá Nhân
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Hãy cho chúng tôi biết về bạn
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Avatar Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ảnh đại diện
                </label>
                <AvatarUpload onUploadComplete={() => {}} />
              </div>

              {/* Name and Age */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={step1Data.full_name}
                    onChange={(e) =>
                      setStep1Data({ ...step1Data, full_name: e.target.value })
                    }
                    placeholder="Nhập họ và tên của bạn"
                    className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Tuổi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={18}
                    max={100}
                    value={step1Data.age}
                    onChange={(e) =>
                      setStep1Data({
                        ...step1Data,
                        age: e.target.value ? parseInt(e.target.value) : "",
                      })
                    }
                    placeholder="Nhập tuổi của bạn"
                    className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* Height and Weight */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Chiều Cao (cm)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={step1Data.height}
                    onChange={(e) =>
                      setStep1Data({
                        ...step1Data,
                        height: e.target.value ? parseInt(e.target.value) : "",
                      })
                    }
                    placeholder="Nhập chiều cao của bạn"
                    className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Cân Nặng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={30}
                    max={300}
                    value={step1Data.weight}
                    onChange={(e) =>
                      setStep1Data({
                        ...step1Data,
                        weight: e.target.value
                          ? parseFloat(e.target.value)
                          : "",
                      })
                    }
                    placeholder="Nhập cân nặng của bạn"
                    className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* Zodiac Sign */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Cung Hoàng Đạo
                </label>
                <select
                  value={step1Data.zodiac_sign}
                  onChange={(e) =>
                    setStep1Data({
                      ...step1Data,
                      zodiac_sign: e.target.value as ZodiacSign,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="">Chọn cung hoàng đạo của bạn</option>
                  {ZODIAC_SIGNS.map((sign) => (
                    <option key={sign} value={sign}>
                      {sign}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hobbies */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Sở Thích & Quan Tâm
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addHobby();
                      }
                    }}
                    placeholder="Chia sẻ sở thích của bạn (vd: đọc sách)"
                    className="h-11 flex-1 rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={addHobby}
                    className="h-11 rounded-xl bg-blue-600 px-6 font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                {step1Data.hobbies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step1Data.hobbies.map((hobby) => (
                      <span
                        key={hobby}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                      >
                        {hobby}
                        <button
                          type="button"
                          onClick={() => removeHobby(hobby)}
                          className="hover:text-blue-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Lifestyle */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Lối Sống
                </label>
                <textarea
                  rows={3}
                  value={step1Data.lifestyle}
                  onChange={(e) =>
                    setStep1Data({ ...step1Data, lifestyle: e.target.value })
                  }
                  placeholder="Mô tả lối sống của bạn..."
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Favorite Quote */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Câu Nói Yêu Thích
                </label>
                <input
                  type="text"
                  value={step1Data.favorite_quote}
                  onChange={(e) =>
                    setStep1Data({
                      ...step1Data,
                      favorite_quote: e.target.value,
                    })
                  }
                  placeholder="Câu nói hoặc châm ngôn yêu thích"
                  className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Introduction */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Phần Giới Thiệu
                </label>
                <textarea
                  rows={4}
                  value={step1Data.introduction}
                  onChange={(e) =>
                    setStep1Data({ ...step1Data, introduction: e.target.value })
                  }
                  placeholder="Giới thiệu bản thân bạn..."
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Kỹ Năng
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Thêm kỹ năng (vd: Giao tiếp)"
                    className="h-11 flex-1 rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="h-11 rounded-xl bg-blue-600 px-6 font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                {step1Data.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step1Data.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-green-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Kinh Nghiệm
                </label>
                <textarea
                  rows={4}
                  value={step1Data.experience}
                  onChange={(e) =>
                    setStep1Data({ ...step1Data, experience: e.target.value })
                  }
                  placeholder="Mô tả kinh nghiệm làm việc của bạn..."
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Availability Status */}
              <div className="flex items-center justify-between rounded-xl border border-black/10 bg-zinc-50 p-4 dark:border-white/15 dark:bg-zinc-900/50">
                <div>
                  <p className="font-medium text-black dark:text-white">
                    Tình trạng hoạt động
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {step1Data.available ? "Sẵn sàng" : "Tạm khóa"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setStep1Data({
                      ...step1Data,
                      available: !step1Data.available,
                    })
                  }
                  className={`relative h-8 w-14 rounded-full transition-colors ${
                    step1Data.available
                      ? "bg-green-500"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                      step1Data.available ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {saving ? "Đang lưu..." : "Tiếp theo →"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Service Selection & Gallery */}
        {currentStep === 2 && (
          <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-lg dark:border-white/15 dark:bg-zinc-950">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Ảnh & Dịch Vụ Hỗ Trợ
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                4 remaining
              </p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-6">
              {/* Gallery Upload */}
              <MultiImageUpload
                bucket="galleries"
                images={step2Data.gallery_images}
                onImagesChange={(urls) =>
                  setStep2Data({ ...step2Data, gallery_images: urls })
                }
                minImages={3}
                maxImages={10}
                label="Upload gallery ảnh cá nhân"
                description="Upload 3-10 ảnh minh họa để hiển thị trên trang hồ sơ"
              />

              {/* Service Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Loại Dịch Vụ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={step2Data.service_type}
                  onChange={(e) =>
                    setStep2Data({
                      ...step2Data,
                      service_type: e.target.value as ServiceType,
                      service_categories: [],
                      service_level: "",
                    })
                  }
                  className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="">Chọn loại dịch vụ</option>
                  <option value="assistance">Hỗ trợ (Assistance)</option>
                  <option value="companionship">
                    Đồng hành (Companionship)
                  </option>
                </select>
              </div>

              {/* Assistance Categories - Card Select Style */}
              {step2Data.service_type === "assistance" && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Chọn loại dịch vụ bạn muốn cung cấp <span className="text-red-500">*</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        value: "personal_assist" as AssistanceCategory,
                        title: "Hỗ Trợ Cá Nhân",
                        description: "Hỗ trợ hành chính và dịch thuật",
                        icon: (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ),
                        color: "from-green-500 to-emerald-600",
                        bgColor: "bg-green-50 dark:bg-green-950/20",
                        borderColor: "border-green-300 dark:border-green-700",
                      },
                      {
                        value: "professional_onsite_assist" as AssistanceCategory,
                        title: "Hỗ Trợ Chuyên Nghiệp",
                        description: "Hỗ trợ chuyên nghiệp tại chỗ",
                        icon: (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ),
                        color: "from-blue-500 to-cyan-600",
                        bgColor: "bg-blue-50 dark:bg-blue-950/20",
                        borderColor: "border-blue-300 dark:border-blue-700",
                      },
                      {
                        value: "virtual_assist" as AssistanceCategory,
                        title: "Hỗ Trợ Từ Xa",
                        description: "Hỗ trợ trực tuyến và từ xa",
                        icon: (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ),
                        color: "from-purple-500 to-pink-600",
                        bgColor: "bg-purple-50 dark:bg-purple-950/20",
                        borderColor: "border-purple-300 dark:border-purple-700",
                      },
                      {
                        value: "tour_guide" as AssistanceCategory,
                        title: "Hướng Dẫn Viên",
                        description: "Hướng dẫn du lịch và tham quan",
                        icon: (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        ),
                        color: "from-orange-500 to-red-600",
                        bgColor: "bg-orange-50 dark:bg-orange-950/20",
                        borderColor: "border-orange-300 dark:border-orange-700",
                      },
                      {
                        value: "translator" as AssistanceCategory,
                        title: "Phiên Dịch",
                        description: "Dịch thuật và phiên dịch",
                        icon: (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        ),
                        color: "from-indigo-500 to-violet-600",
                        bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
                        borderColor: "border-indigo-300 dark:border-indigo-700",
                      },
                    ].map((category) => {
                      const isSelected = step2Data.service_categories.includes(category.value);
                      return (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setStep2Data({
                                ...step2Data,
                                service_categories: step2Data.service_categories.filter(
                                  (c) => c !== category.value
                                ),
                                service_languages: category.value === "translator" 
                                  ? [] 
                                  : step2Data.service_languages,
                              });
                            } else {
                              setStep2Data({
                                ...step2Data,
                                service_categories: [...step2Data.service_categories, category.value],
                              });
                            }
                          }}
                          className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                            isSelected
                              ? `${category.borderColor} ${category.bgColor} border-2 shadow-sm`
                              : "border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900/50"
                          }`}
                        >
                          {/* Checkmark indicator */}
                          {isSelected && (
                            <div className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${category.color} text-white`}>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          
                          {/* Icon */}
                          <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${category.color} text-white`}>
                            {category.icon}
                          </div>
                          
                          {/* Title */}
                          <h3 className="mb-1 text-base font-semibold text-black dark:text-white">
                            {category.title}
                          </h3>
                          
                          {/* Description */}
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {category.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Translator Languages */}
              {step2Data.service_categories.includes("translator") && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Ngôn Ngữ Phiên Dịch
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLanguage();
                        }
                      }}
                      placeholder="Thêm ngôn ngữ (vd: English, 日本語)"
                      className="h-11 flex-1 rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="h-11 rounded-xl bg-blue-600 px-6 font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                  {step2Data.service_languages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {step2Data.service_languages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => removeLanguage(lang)}
                            className="hover:text-purple-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Companionship Levels */}
              {step2Data.service_type === "companionship" && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Cấp Độ Đồng Hành <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 p-4 transition-colors hover:bg-zinc-50 dark:border-white/15 dark:hover:bg-zinc-900/50">
                      <input
                        type="radio"
                        name="service_level"
                        value="1"
                        checked={step2Data.service_level === 1}
                        onChange={() =>
                          setStep2Data({ ...step2Data, service_level: 1 })
                        }
                        className="mt-1 h-5 w-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-black dark:text-white">
                          Cấp độ 1
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Không tiếp xúc cơ thể, không yêu cầu trò chuyện trí
                          tuệ, trang phục thường ngày
                        </p>
                      </div>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 p-4 transition-colors hover:bg-zinc-50 dark:border-white/15 dark:hover:bg-zinc-900/50">
                      <input
                        type="radio"
                        name="service_level"
                        value="2"
                        checked={step2Data.service_level === 2}
                        onChange={() =>
                          setStep2Data({ ...step2Data, service_level: 2 })
                        }
                        className="mt-1 h-5 w-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-black dark:text-white">
                          Cấp độ 2
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Không tiếp xúc cơ thể, có trò chuyện trí tuệ, trang
                          phục bán trang trọng
                        </p>
                      </div>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 p-4 transition-colors hover:bg-zinc-50 dark:border-white/15 dark:hover:bg-zinc-900/50">
                      <input
                        type="radio"
                        name="service_level"
                        value="3"
                        checked={step2Data.service_level === 3}
                        onChange={() =>
                          setStep2Data({ ...step2Data, service_level: 3 })
                        }
                        className="mt-1 h-5 w-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-black dark:text-white">
                          Cấp độ 3
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Có tiếp xúc cơ thể (không thân mật), có trò chuyện trí
                          tuệ, trang phục trang trọng
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="h-12 flex-1 rounded-xl border border-black/10 font-semibold text-black transition-all hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-12 flex-1 rounded-xl bg-blue-600 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {saving ? "Đang lưu..." : "Tiếp theo →"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Pricing Setup */}
        {currentStep === 3 && (
          <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-lg dark:border-white/15 dark:bg-zinc-950">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Thiết Lập Giá
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Đặt giá dịch vụ cho các khoảng thời gian khác nhau
              </p>
            </div>

            <form onSubmit={handleStep3Submit} className="space-y-6">
              {/* Currency */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tiền Tệ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={step3Data.currency}
                  onChange={(e) =>
                    setStep3Data({
                      ...step3Data,
                      currency: e.target.value as any,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-zinc-950 dark:text-white"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Per-Service Pricing for Assistance */}
              {step2Data.service_type === "assistance" && step2Data.service_categories.length > 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                      Đặt Giá Cho Từng Dịch Vụ
                    </h3>
                    <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                      Mỗi dịch vụ có thể có mức giá khác nhau. Vui lòng nhập giá cho từng dịch vụ bạn đã chọn.
                    </p>
                  </div>

                  {step2Data.service_categories.map((category) => {
                    const categoryNames: Record<AssistanceCategory, string> = {
                      personal_assist: "Hỗ Trợ Cá Nhân",
                      professional_onsite_assist: "Hỗ Trợ Chuyên Nghiệp",
                      virtual_assist: "Hỗ Trợ Từ Xa",
                      tour_guide: "Hướng Dẫn Viên",
                      translator: "Phiên Dịch",
                    };

                    const pricing = step3Data.service_pricing[category] || {
                      hourly_rate: "",
                      daily_rate: "",
                      monthly_rate: "",
                      min_booking_hours: 2,
                    };

                    return (
                      <div
                        key={category}
                        className="rounded-xl border border-black/10 bg-zinc-50 p-6 dark:border-white/15 dark:bg-zinc-900/50"
                      >
                        <h4 className="mb-4 text-base font-semibold text-black dark:text-white">
                          {categoryNames[category]}
                        </h4>

                        <div className="space-y-4">
                          {/* Hourly Rate and Min Hours */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Giá Theo Giờ <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={pricing.hourly_rate}
                                onChange={(e) =>
                                  updateServicePricing(category, "hourly_rate", e.target.value)
                                }
                                placeholder="Nhập giá theo giờ"
                                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Số Giờ Đặt Tối Thiểu <span className="text-red-500">*</span>
                              </label>
                              <select
                                required
                                value={pricing.min_booking_hours}
                                onChange={(e) =>
                                  updateServicePricing(
                                    category,
                                    "min_booking_hours",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-zinc-950 dark:text-white"
                              >
                                <option value={2}>2 hours</option>
                                <option value={3}>3 hours</option>
                                <option value={4}>4 hours</option>
                                <option value={5}>5 hours</option>
                                <option value={6}>6 hours</option>
                                <option value={8}>8 hours</option>
                              </select>
                            </div>
                          </div>

                          {/* Auto-calculated Rates */}
                          {pricing.hourly_rate && (
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-lg bg-white p-3 dark:bg-zinc-900">
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                  Giá Theo Ngày (8 giờ)
                                </p>
                                <p className="mt-1 text-lg font-semibold text-black dark:text-white">
                                  {CURRENCIES.find((c) => c.code === step3Data.currency)
                                    ?.symbol || "$"}
                                  {calculateDailyRate(pricing.hourly_rate)}
                                </p>
                              </div>

                              <div className="rounded-lg bg-white p-3 dark:bg-zinc-900">
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                  Giá Theo Tháng (160 giờ)
                                </p>
                                <p className="mt-1 text-lg font-semibold text-black dark:text-white">
                                  {CURRENCIES.find((c) => c.code === step3Data.currency)
                                    ?.symbol || "$"}
                                  {calculateMonthlyRate(pricing.hourly_rate)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legacy Pricing for Companionship */}
              {step2Data.service_type === "companionship" && (
                <>
                  {/* Hourly Rate and Min Hours */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Giá Theo Giờ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={step3Data.hourly_rate}
                        onChange={(e) =>
                          setStep3Data({
                            ...step3Data,
                            hourly_rate: e.target.value,
                          })
                        }
                        placeholder="Nhập giá theo giờ"
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Số Giờ Đặt Tối Thiểu <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={step3Data.min_booking_hours}
                        onChange={(e) =>
                          setStep3Data({
                            ...step3Data,
                            min_booking_hours: parseInt(e.target.value),
                          })
                        }
                        className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/15 dark:bg-zinc-950 dark:text-white"
                      >
                        <option value={2}>2 hours</option>
                        <option value={3}>3 hours</option>
                        <option value={4}>4 hours</option>
                        <option value={5}>5 hours</option>
                        <option value={6}>6 hours</option>
                        <option value={8}>8 hours</option>
                      </select>
                    </div>
                  </div>

                  {/* Auto-calculated Rates */}
                  {step3Data.hourly_rate && (
                    <div className="space-y-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/20">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg bg-white p-3 dark:bg-zinc-900">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            Giá Theo Ngày (8 giờ)
                          </p>
                          <p className="mt-1 text-lg font-semibold text-black dark:text-white">
                            {CURRENCIES.find((c) => c.code === step3Data.currency)
                              ?.symbol || "$"}
                            {calculateDailyRate(step3Data.hourly_rate)}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white p-3 dark:bg-zinc-900">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            Giá Theo Tháng (160 giờ)
                          </p>
                          <p className="mt-1 text-lg font-semibold text-black dark:text-white">
                            {CURRENCIES.find((c) => c.code === step3Data.currency)
                              ?.symbol || "$"}
                            {calculateMonthlyRate(step3Data.hourly_rate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Service Images */}
              <MultiImageUpload
                bucket="services"
                images={step3Data.service_images}
                onImagesChange={(urls) =>
                  setStep3Data({ ...step3Data, service_images: urls })
                }
                minImages={0}
                maxImages={5}
                label="Upload ảnh minh họa cho dịch vụ (tùy chọn)"
                description="Upload tối đa 5 ảnh minh họa dịch vụ của bạn"
              />

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="h-12 flex-1 rounded-xl border border-black/10 font-semibold text-black transition-all hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-12 flex-1 rounded-xl bg-green-600 font-semibold text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  {saving ? "Đang lưu..." : "Hoàn tất ✓"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
