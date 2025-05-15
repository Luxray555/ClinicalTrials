import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/auth/get-current-user";
import { authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "@@/routes";

// Configure i18n middleware
const intlMiddleware = createMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en",
});

export default async function middleware(req: NextRequest) {
  const nextUrl = req.nextUrl;
  const pathname = nextUrl.pathname;

  // ✅ Exclude UploadThing API routes
  if (pathname.startsWith("/api/uploadthing")) {
    return NextResponse.next(); // Allow UploadThing to function properly
  }

  const currentUser = await getCurrentUser();
  const isLoggedIn = !("error" in currentUser);

  // Extract the locale (e.g., "fr" or "en")
  const localePrefix = pathname.split("/")[1];
  const pathnameWithoutLocale = pathname.replace(`/${localePrefix}`, "") || "/";

  const isAuthRoute = authRoutes.includes(pathnameWithoutLocale);
  const isPublicRoute = publicRoutes.includes(pathnameWithoutLocale);

  // ✅ Skip next-intl for ALL API routes (not just UploadThing)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return intlMiddleware(req);
  }

  if (pathnameWithoutLocale.startsWith("/studies")) {
    return intlMiddleware(req);
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(
      new URL(`/${localePrefix}/auth/login`, nextUrl),
    );
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", // Exclude static files and Next.js internals
    "/",
    "/(fr|en)/:path*", // Include localized paths
  ],
};
