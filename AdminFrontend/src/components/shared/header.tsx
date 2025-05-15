"use client";

import { Button } from "../ui/button";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import LocaleSwitcher from "./locale-switcher";
import logoText from "@@/public/images/logo_text.png";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { logout } from "@/api-access/server-side-data-access/actions/auth/logout";
import Image from "next/image";

export default function Header() {
  const pathName = usePathname();
  const router = useRouter();
  const t = useTranslations("Header");
  const { currentUser, refreshUser } = useCurrentUser();

  async function logoutClicked() {
    const data = await logout();
    if ("error" in data) {
      console.error("Error logging out:", data.error);
      return;
    }
    await refreshUser();
    router.push("/auth/login");
  }

  const links = [
    // { href: "/", label: t("home") },
  ];

  const userLinks = [{ href: "/dashboard", label: t("dashboard") }];

  return (
    <>
      {!currentUser && (
        <header className="top-0 z-50 flex h-10 w-full items-center justify-between bg-background px-5 py-8 shadow-md lg:px-10">
          <Image
            src={logoText}
            alt="Clinical trials text logo"
            className="h-8 w-fit object-contain"
          />

          {currentUser === null ? (
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
          ) : (
            <ul className="z-10 mx-4 flex flex-1 items-center justify-end gap-5 bg-white">
              {userLinks.map(({ href, label }) => (
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
          )}

          <div className="flex items-center justify-between gap-5">
            <LocaleSwitcher />
            {currentUser === null ? (
              <>
                <Button variant={"link"} className="hover:no-underline" asChild>
                  <Link href="/auth/login" className="font-semibold">
                    {t("login")}
                  </Link>
                </Button>
                <Button asChild>
                  {/* <Link href="/auth/register" className="font-semibold">
                {t("register")}
              </Link> */}
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 rounded-full p-0"
                  >
                    <Avatar>
                      <AvatarImage alt={currentUser?.email || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {currentUser?.userName ? (
                          currentUser?.userName[0].toUpperCase()
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {t("signedInAs")}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {/* <DropdownMenuItem>
                  <Link href="/settings" className="flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("settings")}</span>
                  </Link>
                </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={logoutClicked}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
      )}
    </>
  );
}
