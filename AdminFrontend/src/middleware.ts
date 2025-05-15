import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const locales = ["en", "fr"];
const defaultLocale = "en";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const startsWithLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!startsWithLocale) {
    // Get the locale from cookies or fallback to default
    const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
    const redirectLocale = locales.includes(cookieLocale ?? "")
      ? cookieLocale
      : defaultLocale;

    const url = new URL(`/${redirectLocale}${pathname}`, req.nextUrl.origin);
    return NextResponse.redirect(url);
  }

  // Extract locale and strip it from path
  const matchedLocale = locales.find((locale) =>
    pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  let cleanedPath = pathname;
  if (matchedLocale) {
    cleanedPath = pathname.replace(`/${matchedLocale}`, "") || "/";
  }

  const response = createMiddleware(routing)(req);
  response.headers.set("x-current-path", cleanedPath);
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
