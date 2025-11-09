"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useT, useLocale } from "@/i18n/provider";
import AvatarUpload from "@/components/AvatarUpload";
import MultiImageUpload from "@/components/MultiImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Loader2,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  DollarSign,
} from "lucide-react";

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
  service_categories: AssistanceCategory[];
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
  service_pricing: Record<string, ServicePricing>;
  service_images: string[];
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

  const [step2Data, setStep2Data] = useState<Step2Data>({
    gallery_images: [],
    service_type: "",
    service_categories: [],
    service_level: "",
    service_languages: [],
  });

  const [newLanguage, setNewLanguage] = useState("");

  const [step3Data, setStep3Data] = useState<Step3Data>({
    currency: "USD",
    service_pricing: {},
    service_images: [],
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

      const { data: userData } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", session.user.id)
        .single();

      if (!userData || userData.role !== "worker") {
        router.push(`/${locale}`);
        return;
      }

      const { data: profileData } = await supabase
        .from("worker_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
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
          service_categories:
            profileData.service_categories ||
            (profileData.service_category
              ? [profileData.service_category]
              : []),
          service_level: profileData.service_level || "",
          service_languages: profileData.service_languages || [],
        });

        let servicePricing: Record<string, ServicePricing> = {};
        if (
          profileData.service_pricing &&
          typeof profileData.service_pricing === "object"
        ) {
          servicePricing = profileData.service_pricing as Record<
            string,
            ServicePricing
          >;
        } else if (profileData.service_category && profileData.hourly_rate) {
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
          hourly_rate: profileData.hourly_rate?.toString() || "",
          min_booking_hours: profileData.min_booking_hours || 2,
        });

        if (profileData.setup_step && !profileData.setup_completed) {
          setCurrentStep(profileData.setup_step);
        } else if (profileData.setup_completed) {
          setCurrentStep(1);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Auth error:", err);
      router.push(`/${locale}/login`);
    }
  }

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

      const { error: userError } = await supabase
        .from("users")
        .update({ full_name: step1Data.full_name })
        .eq("id", userId);

      if (userError) throw userError;

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
          service_languages: step2Data.service_categories.includes("translator")
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

    if (
      step2Data.service_type === "assistance" &&
      step2Data.service_categories.length > 0
    ) {
      for (const category of step2Data.service_categories) {
        const pricing = step3Data.service_pricing[category];
        if (
          !pricing ||
          !pricing.hourly_rate ||
          parseFloat(pricing.hourly_rate) <= 0
        ) {
          setError(`Please enter pricing for ${category.replace(/_/g, " ")}`);
          return;
        }
      }
    } else if (step2Data.service_type === "companionship") {
      if (!step3Data.hourly_rate || parseFloat(step3Data.hourly_rate) <= 0) {
        setError("Please enter a valid hourly rate");
        return;
      }
    }

    setSaving(true);

    try {
      if (!userId) return;

      const servicePricingJson: Record<string, any> = {};
      if (
        step2Data.service_type === "assistance" &&
        step2Data.service_categories.length > 0
      ) {
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

      let legacyHourlyRate = null;
      if (
        step2Data.service_type === "assistance" &&
        step2Data.service_categories.length > 0
      ) {
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
          hourly_rate: legacyHourlyRate,
          min_booking_hours:
            step2Data.service_type === "assistance" &&
            step2Data.service_categories.length > 0
              ? step3Data.service_pricing[step2Data.service_categories[0]]
                  ?.min_booking_hours || 2
              : step3Data.min_booking_hours,
          service_images: step3Data.service_images,
          setup_step: 4,
          setup_completed: true,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

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
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Service", icon: Briefcase },
    { number: 3, title: "Rates", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-semibold transition-colors ${
                      currentStep >= step.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="mt-2 hidden text-xs font-medium sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <Separator
                    className={`flex-1 mx-4 ${
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Step {currentStep} of 3 • {Math.round((currentStep / 3) * 100)}%
            Complete
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Chi Tiết Cá Nhân</CardTitle>
              <CardDescription>Hãy cho chúng tôi biết về bạn</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleStep1Submit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label>Ảnh đại diện</Label>
                  <AvatarUpload onUploadComplete={() => {}} />
                </div>

                {/* Name and Age */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      Họ và Tên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      required
                      value={step1Data.full_name}
                      onChange={(e) =>
                        setStep1Data({
                          ...step1Data,
                          full_name: e.target.value,
                        })
                      }
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">
                      Tuổi <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="age"
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
                    />
                  </div>
                </div>

                {/* Height and Weight */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="height">Chiều Cao (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min={100}
                      max={250}
                      value={step1Data.height}
                      onChange={(e) =>
                        setStep1Data({
                          ...step1Data,
                          height: e.target.value
                            ? parseInt(e.target.value)
                            : "",
                        })
                      }
                      placeholder="Nhập chiều cao của bạn"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Cân Nặng (kg)</Label>
                    <Input
                      id="weight"
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
                    />
                  </div>
                </div>

                {/* Zodiac Sign */}
                <div className="space-y-2">
                  <Label htmlFor="zodiac">Cung Hoàng Đạo</Label>
                  <Select
                    value={step1Data.zodiac_sign}
                    onValueChange={(value) =>
                      setStep1Data({
                        ...step1Data,
                        zodiac_sign: value as ZodiacSign,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cung hoàng đạo của bạn" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZODIAC_SIGNS.map((sign) => (
                        <SelectItem key={sign} value={sign}>
                          {sign}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hobbies */}
                <div className="space-y-2">
                  <Label>Sở Thích & Quan Tâm</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newHobby}
                      onChange={(e) => setNewHobby(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addHobby();
                        }
                      }}
                      placeholder="Chia sẻ sở thích của bạn (vd: đọc sách)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addHobby}>
                      Add
                    </Button>
                  </div>
                  {step1Data.hobbies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {step1Data.hobbies.map((hobby) => (
                        <Badge
                          key={hobby}
                          variant="secondary"
                          className="gap-1"
                        >
                          {hobby}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeHobby(hobby)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lifestyle */}
                <div className="space-y-2">
                  <Label htmlFor="lifestyle">Lối Sống</Label>
                  <Textarea
                    id="lifestyle"
                    rows={3}
                    value={step1Data.lifestyle}
                    onChange={(e) =>
                      setStep1Data({ ...step1Data, lifestyle: e.target.value })
                    }
                    placeholder="Mô tả lối sống của bạn..."
                  />
                </div>

                {/* Favorite Quote */}
                <div className="space-y-2">
                  <Label htmlFor="quote">Câu Nói Yêu Thích</Label>
                  <Input
                    id="quote"
                    value={step1Data.favorite_quote}
                    onChange={(e) =>
                      setStep1Data({
                        ...step1Data,
                        favorite_quote: e.target.value,
                      })
                    }
                    placeholder="Câu nói hoặc châm ngôn yêu thích"
                  />
                </div>

                {/* Introduction */}
                <div className="space-y-2">
                  <Label htmlFor="introduction">Phần Giới Thiệu</Label>
                  <Textarea
                    id="introduction"
                    rows={4}
                    value={step1Data.introduction}
                    onChange={(e) =>
                      setStep1Data({
                        ...step1Data,
                        introduction: e.target.value,
                      })
                    }
                    placeholder="Giới thiệu bản thân bạn..."
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Kỹ Năng</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Thêm kỹ năng (vd: Giao tiếp)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                  {step1Data.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {step1Data.skills.map((skill) => (
                        <Badge key={skill} className="gap-1">
                          {skill}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Kinh Nghiệm</Label>
                  <Textarea
                    id="experience"
                    rows={4}
                    value={step1Data.experience}
                    onChange={(e) =>
                      setStep1Data({ ...step1Data, experience: e.target.value })
                    }
                    placeholder="Mô tả kinh nghiệm làm việc của bạn..."
                  />
                </div>

                {/* Availability Status */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Tình trạng hoạt động</Label>
                    <p className="text-sm text-muted-foreground">
                      {step1Data.available ? "Sẵn sàng" : "Tạm khóa"}
                    </p>
                  </div>
                  <Switch
                    checked={step1Data.available}
                    onCheckedChange={(checked) =>
                      setStep1Data({
                        ...step1Data,
                        available: checked,
                      })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <span>Tiếp theo</span>
                      <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Service Selection & Gallery */}
        {currentStep === 2 && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Ảnh & Dịch Vụ Hỗ Trợ</CardTitle>
              <CardDescription>
                Upload ảnh và chọn loại dịch vụ bạn cung cấp
              </CardDescription>
            </CardHeader>

            <CardContent>
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
                <div className="space-y-2">
                  <Label>
                    Loại Dịch Vụ <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={step2Data.service_type}
                    onValueChange={(value) =>
                      setStep2Data({
                        ...step2Data,
                        service_type: value as ServiceType,
                        service_categories: [],
                        service_level: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assistance">
                        Hỗ trợ (Assistance)
                      </SelectItem>
                      <SelectItem value="companionship">
                        Đồng hành (Companionship)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assistance Categories */}
                {step2Data.service_type === "assistance" && (
                  <div className="space-y-3">
                    <Label>
                      Chọn loại dịch vụ bạn muốn cung cấp{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          value: "personal_assist" as AssistanceCategory,
                          title: "Hỗ Trợ Cá Nhân",
                          description: "Hỗ trợ hành chính và dịch thuật",
                        },
                        {
                          value:
                            "professional_onsite_assist" as AssistanceCategory,
                          title: "Hỗ Trợ Chuyên Nghiệp",
                          description: "Hỗ trợ chuyên nghiệp tại chỗ",
                        },
                        {
                          value: "virtual_assist" as AssistanceCategory,
                          title: "Hỗ Trợ Từ Xa",
                          description: "Hỗ trợ trực tuyến và từ xa",
                        },
                        {
                          value: "tour_guide" as AssistanceCategory,
                          title: "Hướng Dẫn Viên",
                          description: "Hướng dẫn du lịch và tham quan",
                        },
                        {
                          value: "translator" as AssistanceCategory,
                          title: "Phiên Dịch",
                          description: "Dịch thuật và phiên dịch",
                        },
                      ].map((category) => {
                        const isSelected =
                          step2Data.service_categories.includes(category.value);
                        return (
                          <Card
                            key={category.value}
                            className={`cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary shadow-md"
                                : "hover:shadow-md"
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setStep2Data({
                                  ...step2Data,
                                  service_categories:
                                    step2Data.service_categories.filter(
                                      (c) => c !== category.value
                                    ),
                                  service_languages:
                                    category.value === "translator"
                                      ? []
                                      : step2Data.service_languages,
                                });
                              } else {
                                setStep2Data({
                                  ...step2Data,
                                  service_categories: [
                                    ...step2Data.service_categories,
                                    category.value,
                                  ],
                                });
                              }
                            }}
                          >
                            <CardHeader className="pb-3">
                              {isSelected && (
                                <div className="absolute right-3 top-3">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="h-4 w-4" />
                                  </div>
                                </div>
                              )}
                              <CardTitle className="text-base">
                                {category.title}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {category.description}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Translator Languages */}
                {step2Data.service_categories.includes("translator") && (
                  <div className="space-y-2">
                    <Label>Ngôn Ngữ Phiên Dịch</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addLanguage();
                          }
                        }}
                        placeholder="Thêm ngôn ngữ (vd: English, 日本語)"
                        className="flex-1"
                      />
                      <Button type="button" onClick={addLanguage}>
                        Add
                      </Button>
                    </div>
                    {step2Data.service_languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {step2Data.service_languages.map((lang) => (
                          <Badge
                            key={lang}
                            variant="secondary"
                            className="gap-1"
                          >
                            {lang}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeLanguage(lang)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Companionship Levels */}
                {step2Data.service_type === "companionship" && (
                  <div className="space-y-3">
                    <Label>
                      Cấp Độ Đồng Hành{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={step2Data.service_level.toString()}
                      onValueChange={(value) =>
                        setStep2Data({
                          ...step2Data,
                          service_level: parseInt(value) as CompanionshipLevel,
                        })
                      }
                    >
                      <div className="flex items-start space-x-3 rounded-lg border p-4">
                        <RadioGroupItem
                          value="1"
                          id="level1"
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="level1"
                            className="font-medium cursor-pointer"
                          >
                            Cấp độ 1
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Không tiếp xúc cơ thể, không yêu cầu trò chuyện trí
                            tuệ, trang phục thường ngày
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-lg border p-4">
                        <RadioGroupItem
                          value="2"
                          id="level2"
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="level2"
                            className="font-medium cursor-pointer"
                          >
                            Cấp độ 2
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Không tiếp xúc cơ thể, có trò chuyện trí tuệ, trang
                            phục bán trang trọng
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-lg border p-4">
                        <RadioGroupItem
                          value="3"
                          id="level3"
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="level3"
                            className="font-medium cursor-pointer"
                          >
                            Cấp độ 3
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Có tiếp xúc cơ thể (không thân mật), có trò chuyện
                            trí tuệ, trang phục trang trọng
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
                    <span>Quay lại</span>
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <span>Tiếp theo</span>
                        <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Pricing Setup */}
        {currentStep === 3 && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Thiết Lập Giá</CardTitle>
              <CardDescription>
                Đặt giá dịch vụ cho các khoảng thời gian khác nhau
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleStep3Submit} className="space-y-6">
                {/* Currency */}
                <div className="space-y-2">
                  <Label>
                    Tiền Tệ <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={step3Data.currency}
                    onValueChange={(value) =>
                      setStep3Data({
                        ...step3Data,
                        currency: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Per-Service Pricing for Assistance */}
                {step2Data.service_type === "assistance" &&
                  step2Data.service_categories.length > 0 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Đặt Giá Cho Từng Dịch Vụ
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Mỗi dịch vụ có thể có mức giá khác nhau. Vui lòng nhập
                          giá cho từng dịch vụ bạn đã chọn.
                        </p>
                      </div>

                      {step2Data.service_categories.map((category) => {
                        const categoryNames: Record<
                          AssistanceCategory,
                          string
                        > = {
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
                          <Card key={category} className="bg-muted/50">
                            <CardHeader>
                              <CardTitle className="text-base">
                                {categoryNames[category]}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>
                                    Giá Theo Giờ{" "}
                                    <span className="text-destructive">*</span>
                                  </Label>
                                  <Input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={pricing.hourly_rate}
                                    onChange={(e) =>
                                      updateServicePricing(
                                        category,
                                        "hourly_rate",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Nhập giá theo giờ"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>
                                    Số Giờ Đặt Tối Thiểu{" "}
                                    <span className="text-destructive">*</span>
                                  </Label>
                                  <Select
                                    value={pricing.min_booking_hours.toString()}
                                    onValueChange={(value) =>
                                      updateServicePricing(
                                        category,
                                        "min_booking_hours",
                                        parseInt(value)
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[2, 3, 4, 5, 6, 8].map((hours) => (
                                        <SelectItem
                                          key={hours}
                                          value={hours.toString()}
                                        >
                                          {hours} hours
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {pricing.hourly_rate && (
                                <div className="grid gap-3 md:grid-cols-2">
                                  <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">
                                      Giá Theo Ngày (8 giờ)
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">
                                      {CURRENCIES.find(
                                        (c) => c.code === step3Data.currency
                                      )?.symbol || "$"}
                                      {calculateDailyRate(pricing.hourly_rate)}
                                    </p>
                                  </div>

                                  <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">
                                      Giá Theo Tháng (160 giờ)
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">
                                      {CURRENCIES.find(
                                        (c) => c.code === step3Data.currency
                                      )?.symbol || "$"}
                                      {calculateMonthlyRate(
                                        pricing.hourly_rate
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                {/* Legacy Pricing for Companionship */}
                {step2Data.service_type === "companionship" && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          Giá Theo Giờ{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
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
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Số Giờ Đặt Tối Thiểu{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={step3Data.min_booking_hours.toString()}
                          onValueChange={(value) =>
                            setStep3Data({
                              ...step3Data,
                              min_booking_hours: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 3, 4, 5, 6, 8].map((hours) => (
                              <SelectItem key={hours} value={hours.toString()}>
                                {hours} hours
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {step3Data.hourly_rate && (
                      <Card className="bg-primary/5">
                        <CardContent className="pt-6">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg border bg-background p-3">
                              <p className="text-xs text-muted-foreground">
                                Giá Theo Ngày (8 giờ)
                              </p>
                              <p className="mt-1 text-lg font-semibold">
                                {CURRENCIES.find(
                                  (c) => c.code === step3Data.currency
                                )?.symbol || "$"}
                                {calculateDailyRate(step3Data.hourly_rate)}
                              </p>
                            </div>

                            <div className="rounded-lg border bg-background p-3">
                              <p className="text-xs text-muted-foreground">
                                Giá Theo Tháng (160 giờ)
                              </p>
                              <p className="mt-1 text-lg font-semibold">
                                {CURRENCIES.find(
                                  (c) => c.code === step3Data.currency
                                )?.symbol || "$"}
                                {calculateMonthlyRate(step3Data.hourly_rate)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
                    <span>Quay lại</span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                    variant="default"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4 shrink-0" />
                        <span>Hoàn tất</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
