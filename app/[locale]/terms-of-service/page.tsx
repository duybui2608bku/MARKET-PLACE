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
    (messages?.Legal?.terms?.title as string) ||
    (locale === "en" ? "Terms of Service" : "Điều Khoản Dịch Vụ");
  const description =
    (messages?.Legal?.terms?.intro as string) ||
    (locale === "en"
      ? "Terms of Service of MarketPlace: conditions of use, user rights and obligations."
      : "Điều khoản sử dụng dịch vụ của MarketPlace: điều kiện sử dụng, quyền và nghĩa vụ của người dùng.");
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

export default async function TermsOfServicePage({
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
        {t("Legal.terms.title", "Điều Khoản Dịch Vụ")}
      </h1>

      <p className="text-[#6B5757] mb-6">{t("Legal.terms.intro")}</p>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.terms.section1Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.terms.section1Text")}</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.terms.section2Title")}
        </h2>
        <ul className="list-disc pl-6 text-[#6B5757] space-y-2">
          <li>{t("Legal.terms.section2Item1")}</li>
          <li>{t("Legal.terms.section2Item2")}</li>
          <li>{t("Legal.terms.section2Item3")}</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.terms.section3Title")}
        </h2>
        <ul className="list-disc pl-6 text-[#6B5757] space-y-2">
          <li>{t("Legal.terms.section3Item1")}</li>
          <li>{t("Legal.terms.section3Item2")}</li>
          <li>{t("Legal.terms.section3Item3")}</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.terms.section4Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.terms.section4Text")}</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.terms.section5Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.terms.section5Text")}</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.terms.section6Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.terms.section6Text")}</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.terms.section7Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.terms.section7Text")}</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.terms.section8Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.terms.section8Text")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#2A1F1F]">
          {t("Legal.terms.section9Title")}
        </h2>
        <p className="text-[#6B5757]">{t("Legal.terms.section9Text")}</p>
      </section>
    </div>
  );
}


