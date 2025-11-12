import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Load localized title/description for metadata
  let messages: any;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    messages = (await import("@/messages/vi.json")).default;
  }
  const title =
    (messages?.Legal?.privacy?.title as string) ||
    (locale === "en" ? "Privacy Policy" : "Chính Sách Bảo Mật");
  const description =
    (messages?.Legal?.privacy?.intro as string) ||
    (locale === "en"
      ? "Privacy policy of MarketPlace: how we collect, use and protect personal data."
      : "Chính sách bảo mật của MarketPlace: cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân.");
  return {
    title,
    description,
  };
}

function getByPath(obj: any, path: string) {
  return path
    .split(".")
    .reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), obj);
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

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await loadMessages(locale);
  const t = (key: string, fallback?: string) =>
    (getByPath(messages, key) as string | undefined) ?? (fallback ?? key);
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-[#2A1F1F]">
        {t("Legal.privacy.title", "Chính Sách Bảo Mật")}
      </h1>

      <p className="text-[#6B5757] mb-6">{t("Legal.privacy.intro")}</p>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.privacy.section1Title")}
        </h2>
        <ul className="list-disc pl-6 text-[#6B5757] space-y-2">
          <li>{t("Legal.privacy.section1Item1")}</li>
          <li>{t("Legal.privacy.section1Item2")}</li>
          <li>{t("Legal.privacy.section1Item3")}</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.privacy.section2Title")}
        </h2>
        <ul className="list-disc pl-6 text-[#6B5757] space-y-2">
          <li>{t("Legal.privacy.section2Item1")}</li>
          <li>{t("Legal.privacy.section2Item2")}</li>
          <li>{t("Legal.privacy.section2Item3")}</li>
          <li>{t("Legal.privacy.section2Item4")}</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.privacy.section3Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.privacy.section3Text")}</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.privacy.section4Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.privacy.section4Text")}</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.privacy.section5Title")}
        </h2>
        <ul className="list-disc pl-6 text-[#6B5757] space-y-2">
          <li>{t("Legal.privacy.section5Item1")}</li>
          <li>{t("Legal.privacy.section5Item2")}</li>
          <li>{t("Legal.privacy.section5Item3")}</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.privacy.section6Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.privacy.section6Text")}</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.privacy.section7Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.privacy.section7Text")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.privacy.section8Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.privacy.section8Text")}</p>
      </section>
    </div>
  );
}


