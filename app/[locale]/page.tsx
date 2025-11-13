"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  Shield,
  Star,
  Search,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  TrendingUp,
  Wrench,
  Home as HomeIcon,
  Heart,
  Sparkles,
  Truck,
  Hammer,
} from "lucide-react";
import { useT, useLocale } from "@/i18n/provider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const t = useT();
  const locale = useLocale();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-badge", {
        opacity: 0,
        y: -30,
        duration: 0.8,
      })
        .from(
          ".hero-title",
          {
            opacity: 0,
            y: 50,
            duration: 1,
          },
          "-=0.4"
        )
        .from(
          ".hero-description",
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          ".hero-buttons",
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
          },
          "-=0.4"
        );

      // Animate stats with counting effect
      gsap.from(".stat-number", {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
        },
        textContent: 0,
        duration: 2,
        ease: "power1.out",
        snap: { textContent: 1 },
        stagger: 0.2,
        onUpdate: function () {
          const target = this.targets()[0] as HTMLElement;
          const originalText = target.getAttribute("data-value") || "";
          if (originalText.includes("+")) {
            target.textContent =
              Math.ceil(parseFloat(target.textContent || "0")) + "+";
          } else if (originalText.includes("★")) {
            target.textContent =
              (parseFloat(target.textContent || "0") / 1000).toFixed(1) + "★";
          }
        },
      });

      // Categories Animation - Stagger with scale
      gsap.from(".category-card", {
        scrollTrigger: {
          trigger: categoriesRef.current,
          start: "top 70%",
        },
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
      });

      // Features Animation - Slide from sides
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 70%",
        },
        opacity: 0,
        x: (index) => (index % 2 === 0 ? -100 : 100),
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      });

      // Steps Animation - Sequential reveal
      gsap.from(".step-item", {
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 70%",
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
      });

      // CTA Animation
      gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
        },
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power2.out",
      });

      // Floating animation for decorative elements
      gsap.to(".float-element", {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3,
      });
    });

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Users,
      title: t("Home.features.quickConnect.title"),
      description: t("Home.features.quickConnect.description"),
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Shield,
      title: t("Home.features.security.title"),
      description: t("Home.features.security.description"),
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: Star,
      title: t("Home.features.quality.title"),
      description: t("Home.features.quality.description"),
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Briefcase,
      title: t("Home.features.diverse.title"),
      description: t("Home.features.diverse.description"),
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  const categories = [
    {
      name: t("Home.categories.gardening"),
      count: "150+",
      icon: Sparkles,
      gradient: "from-emerald-400 to-green-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
    },
    {
      name: t("Home.categories.repair"),
      count: "200+",
      icon: Wrench,
      gradient: "from-blue-400 to-indigo-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
    },
    {
      name: t("Home.categories.care"),
      count: "120+",
      icon: Heart,
      gradient: "from-pink-400 to-rose-600",
      bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
    },
    {
      name: t("Home.categories.cleaning"),
      count: "180+",
      icon: HomeIcon,
      gradient: "from-purple-400 to-violet-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
    },
    {
      name: t("Home.categories.construction"),
      count: "90+",
      icon: Hammer,
      gradient: "from-orange-400 to-red-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
    },
    {
      name: t("Home.categories.transport"),
      count: "110+",
      icon: Truck,
      gradient: "from-cyan-400 to-blue-600",
      bgColor: "bg-gradient-to-br from-cyan-50 to-blue-50",
    },
  ];

  const steps = [
    {
      number: "1",
      title: t("Home.howItWorks.step1.title"),
      description: t("Home.howItWorks.step1.description"),
    },
    {
      number: "2",
      title: t("Home.howItWorks.step2.title"),
      description: t("Home.howItWorks.step2.description"),
    },
    {
      number: "3",
      title: t("Home.howItWorks.step3.title"),
      description: t("Home.howItWorks.step3.description"),
    },
    {
      number: "4",
      title: t("Home.howItWorks.step4.title"),
      description: t("Home.howItWorks.step4.description"),
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative px-4 pt-32 pb-20 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50"
      >
        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="float-element absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          <div className="float-element absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>
          <div className="float-element absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <Badge className="hero-badge px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 border-0 shadow-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t("Home.badge")}
            </Badge>

            <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
                {t("Home.heroTitle1")}
              </span>
              <span className="block mt-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("Home.heroTitle2")}
              </span>
              <span className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
                {t("Home.heroTitle3")}
              </span>
            </h1>

            <p className="hero-description text-xl sm:text-2xl text-slate-600 max-w-2xl leading-relaxed">
              {t("Home.heroDescription")}
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="text-base shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 group"
              >
                <Link
                  href={`/${locale}/register`}
                  className="flex items-center"
                >
                  <span>{t("Home.getStarted")}</span>
                  <ArrowRight className="ml-2 h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base border-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Link href={`/${locale}/workers`} className="flex items-center">
                  <Search className="mr-2 h-5 w-5 shrink-0" />
                  <span>{t("Home.searchWorkers")}</span>
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-8 pt-12 w-full max-w-2xl"
            >
              <div className="space-y-2">
                <div
                  className="stat-number text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                  data-value="1000+"
                >
                  1000+
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {t("Home.stats.workers")}
                </div>
              </div>
              <div className="space-y-2">
                <div
                  className="stat-number text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  data-value="5000+"
                >
                  5000+
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {t("Home.stats.jobs")}
                </div>
              </div>
              <div className="space-y-2">
                <div
                  className="stat-number text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent"
                  data-value="4.8★"
                >
                  4.8★
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {t("Home.stats.rating")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section
        ref={categoriesRef}
        className="px-4 py-24 sm:px-6 lg:px-8 bg-white"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {t("Home.categories.title")}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-xl">
              {t("Home.categories.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/${locale}/workers?category=${category.name}`}
                className="group category-card"
              >
                <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 cursor-pointer bg-white border-slate-200 hover:border-transparent overflow-hidden relative">
                  <div
                    className={`absolute inset-0 ${category.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>
                  <CardContent className="p-6 text-center relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br ${category.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 text-slate-900 text-lg">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium">
                      {category.count} {t("Home.categories.workersCount")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {t("Home.features.title")}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-xl">
              {t("Home.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card border-slate-200 shadow-lg bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <CardHeader>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={stepsRef}
        className="px-4 py-24 sm:px-6 lg:px-8 bg-white"
      >
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {t("Home.howItWorks.title")}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-xl">
              {t("Home.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative step-item">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white flex items-center justify-center text-3xl font-bold shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-1 bg-gradient-to-r from-purple-400 via-purple-300 to-transparent rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white/30 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white/20 rounded-full"></div>
          </div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="cta-content max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              {t("Home.cta.title")}
            </h2>
            <p className="text-xl sm:text-2xl text-purple-100 leading-relaxed">
              {t("Home.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                asChild
                size="lg"
                className="text-base bg-white hover:bg-slate-50 text-purple-600 shadow-2xl font-semibold hover:scale-105 transition-transform"
              >
                <Link href={`/${locale}/register`}>
                  {t("Home.cta.registerWorker")}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 font-semibold shadow-xl hover:scale-105 transition-all"
              >
                <Link href={`/${locale}/register`}>
                  {t("Home.cta.findWorkers")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
