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
import { AlignJustify, LogOut, Settings, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeaderMobile() {
  const pathName = usePathname();
  const router = useRouter();
  const t = useTranslations("Header");
  const [currentUser] = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

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
    <header className="sticky top-0 z-50 flex h-10 w-full items-center justify-between border-b border-border bg-background py-8 shadow-md md:hidden">
      <Image
        src={logoText}
        alt="Clinical trials text logo"
        className="h-8 w-fit object-contain pl-2"
      />
      <Button
        variant="link"
        onClick={() => setIsMenuOpen((prevState) => !prevState)}
        className="transition-all hover:scale-105 hover:cursor-pointer"
        asChild
      >
        {isMenuOpen ? (
          <X className="h-14 w-14" />
        ) : (
          <AlignJustify className="h-14 w-14" />
        )}
      </Button>
      <motion.div
        className={cn(
          "fixed top-[65px] flex h-screen w-screen flex-col items-center justify-start gap-5 overflow-hidden bg-background p-5",
          {
            hidden: !isMenuOpen,
          },
        )}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ul className="flex w-full flex-col items-start justify-start gap-5">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "font-medium text-foreground/70 transition-all duration-300 hover:text-primary",
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
        <div className="flex w-full flex-col items-start justify-start gap-5">
          <LocaleSwitcher />
          {currentUser === null && (
            <>
              <Button
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
            <Popover open={isOpen} onOpenChange={setIsOpen}>
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
      </motion.div>
    </header>
  );
}
