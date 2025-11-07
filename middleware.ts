import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "vi", "zh", "ko"] as const;
const DEFAULT_LOCALE = "vi" as const;

function detectLocale(req: NextRequest): string {
  // 1) Cookie override
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as any)) return cookieLocale;

  // 2) Accept-Language header (very simple detection)
  const header = req.headers.get("accept-language") || "";
  const lower = header.toLowerCase();
  for (const lc of SUPPORTED_LOCALES) {
    if (lower.includes(lc)) return lc;
  }
  // 3) Fallback
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore API and static assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasLocalePrefix = SUPPORTED_LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocalePrefix) return NextResponse.next();

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};


