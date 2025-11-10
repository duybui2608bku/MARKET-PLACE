import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { I18nProvider } from "@/i18n/provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { getAdminSettingsServer } from "@/lib/admin-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAdminSettingsServer();

  return {
    title: settings?.site_title || "MarketPlace",
    description: settings?.site_description || "Connect workers with employers",
    keywords: settings?.site_keywords || undefined,
    openGraph: {
      title: settings?.site_title || "MarketPlace",
      description: settings?.site_description || "Connect workers with employers",
      images: settings?.og_image_url ? [settings.og_image_url] : undefined,
    },
  };
}

async function loadMessages(locale: string) {
  try {
    const mod = await import(`@/messages/${locale}.json`);
    return mod.default as Record<string, any>;
  } catch {
    const mod = await import("@/messages/vi.json");
    return mod.default as Record<string, any>;
  }
}

// Generate static params for all supported locales
export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "vi" },
    { locale: "zh" },
    { locale: "ko" },
  ];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await loadMessages(locale);
  const settings = await getAdminSettingsServer();

  return (
    <html lang={locale}>
      <head>
        {settings?.favicon_url && (
          <link rel="icon" href={settings.favicon_url} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-white`}
      >
        <I18nProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
