"use client";

import { Button as ShadButton } from "@/components/ui/button";
import Image from "next/image";
import adminImage from "@@/public/images/admin-cuate.svg"; // Replace with an actual image
import { Link } from "@/i18n/routing";
import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex h-full w-full flex-grow flex-col items-center justify-center">
      <section className="flex h-[100%] w-full flex-col items-center justify-center bg-primary/10 px-24 py-8">
        <div className="flex items-center justify-center">
          <div className="flex w-full flex-col space-y-5">
            <motion.p
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold"
            >
              <span>{t("headline1")}</span>{" "}
              <span className="text-primary">{t("headline2")}</span>{" "}
              <span>{t("headline3")}</span>{" "}
              <span className="text-primary">{t("headline4")}</span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-medium text-foreground/70"
            >
              {t("subheadline")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ShadButton
                asChild
                size={"lg"}
                className="w-fit px-8 text-lg transition-all duration-300 hover:translate-x-4 hover:scale-105"
              >
                <Link href="/auth/login">
                  <span>{t("cta")}</span> <MoveRight />
                </Link>
              </ShadButton>
            </motion.div>
          </div>
          <div className="w-full">
            <Image
              src={adminImage}
              alt={t("imageAlt")}
              className="mx-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
