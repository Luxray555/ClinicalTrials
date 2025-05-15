"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import logoText from "@@/public/images/logo_text.png";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import LocaleSwitcher from "./locale-switcher";
import { useTranslations } from "next-intl";
import { logout } from "@/actions/auth/logout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, Settings, UserRound } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const pathName = usePathname();
  const router = useRouter();
  const t = useTranslations("Header");
  const [currentUser] = useCurrentUser();
  const [isOPen, setIsOpen] = useState(false);

  async function logoutClicked() {
    await logout();
    setIsOpen(false);
    router.push("/auth/login");
  }

  const links = [
    { href: "/", label: t("home") },
    { href: "/search", label: t("search") },
    { href: "/statistics", label: "Statistics" },
  ];

  if (currentUser?.role === "DOCTOR") {
    links.push({
      href: "/patients",
      label: t("patients"),
    });
  }

  if (currentUser?.role === "INVESTIGATOR") {
    links.push({
      href: "/my-trials",
      label: t("myTrials"),
    });
  }

  return (
    <header className="sticky top-0 z-50 flex h-10 w-full items-center justify-between border-b border-border bg-background px-5 py-8 shadow-md max-md:hidden">
      <Image
        src={logoText}
        alt="Clinical trials text logo"
        className="h-8 w-fit object-contain"
      />
      <ul className="flex w-2/5 items-center justify-between">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "px-2 font-medium text-foreground/70 transition-all duration-300 hover:text-primary",
                {
                  "text-primary": pathName === href,
                },
              )}
            >
              {label}
            </Link>
            {pathName === href && (
              <motion.div
                className="h-[2px] w-full bg-primary"
                layoutId="underline"
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-5">
        <LocaleSwitcher />
        {currentUser === null && (
          <>
            <Button
              variant={"link"}
              className="transition-all hover:scale-105 hover:no-underline"
              asChild
            >
              <Link href="/auth/login" className="font-semibold">
                {t("login")}
              </Link>
            </Button>
            <Button asChild className="transition-all hover:scale-105">
              <Link href="/auth/register" className="font-semibold">
                {t("register")}
              </Link>
            </Button>
          </>
        )}
        {currentUser !== null && (
          <Popover open={isOPen} onOpenChange={setIsOpen}>
            <PopoverTrigger>
              <Avatar>
                <AvatarImage src={currentUser.image} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2">
              <div className="flex flex-col">
                <Link href="/profile" className="w-full">
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 font-normal"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserRound size={20} />
                    <p>Profile</p>
                  </Button>
                </Link>
                <Link href="/settings" className="w-full">
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 font-normal"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings size={20} />
                    <p>Settings</p>
                  </Button>
                </Link>
                <Button
                  onClick={logoutClicked}
                  variant="ghost"
                  className="flex items-center justify-start gap-2 font-normal text-destructive hover:text-destructive"
                >
                  <LogOut size={20} />
                  <p>{t("logout")}</p>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
