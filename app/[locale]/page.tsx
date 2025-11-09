"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  TrendingUp
} from "lucide-react";
import { useT, useLocale } from "@/i18n/provider";

export default function Home() {
  const t = useT();
  const locale = useLocale();

  const features = [
    {
      icon: Users,
      title: t("Home.features.quickConnect.title"),
      description: t("Home.features.quickConnect.description"),
    },
    {
      icon: Shield,
      title: t("Home.features.security.title"),
      description: t("Home.features.security.description"),
    },
    {
      icon: Star,
      title: t("Home.features.quality.title"),
      description: t("Home.features.quality.description"),
    },
    {
      icon: Briefcase,
      title: t("Home.features.diverse.title"),
      description: t("Home.features.diverse.description"),
    },
  ];

  const categories = [
    { name: t("Home.categories.gardening"), count: "150+", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    { name: t("Home.categories.repair"), count: "200+", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { name: t("Home.categories.care"), count: "120+", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    { name: t("Home.categories.cleaning"), count: "180+", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
    { name: t("Home.categories.construction"), count: "90+", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    { name: t("Home.categories.transport"), count: "110+", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5">
              <TrendingUp className="w-3 h-3 mr-1.5" />
              {t("Home.badge")}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              {t("Home.heroTitle1")}
              <span className="text-primary block mt-2">{t("Home.heroTitle2")}</span>
              {t("Home.heroTitle3")}
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              {t("Home.heroDescription")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="text-base shadow-lg hover:shadow-xl transition-all">
                <Link href={`/${locale}/register`} className="flex items-center">
                  <span>{t("Home.getStarted")}</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href={`/${locale}/workers`} className="flex items-center">
                  <Search className="mr-2 h-4 w-4 shrink-0" />
                  <span>{t("Home.searchWorkers")}</span>
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 w-full max-w-2xl">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">{t("Home.stats.workers")}</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">{t("Home.stats.jobs")}</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">{t("Home.stats.rating")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("Home.categories.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("Home.categories.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/${locale}/workers?category=${category.name}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${category.color}`}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} {t("Home.categories.workersCount")}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("Home.features.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("Home.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("Home.howItWorks.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("Home.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              {t("Home.cta.title")}
            </h2>
            <p className="text-lg opacity-90">
              {t("Home.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" variant="secondary" className="text-base">
                <Link href={`/${locale}/register`}>
                  {t("Home.cta.registerWorker")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
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
