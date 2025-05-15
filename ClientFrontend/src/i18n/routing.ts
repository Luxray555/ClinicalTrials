import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "fr"],

  // Used when no locale matches
  defaultLocale: "en",
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration

export type Locale = (typeof routing.locales)[number]; // this code purpose is to get the type of the locales array for
// us will be "en" | "fr"

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
