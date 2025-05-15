"use client";
import { Link } from "@/i18n/routing";
import { Button } from "../ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import SearchForm from "./search-form";
import twoDoctorsImg from "@@/public/images/two_doctors.png";
import { useTranslations } from "next-intl";

export default function SearchSection() {
  const t = useTranslations("HomePage.SearchSection");

  return (
    <section className="flex w-full flex-col items-center justify-center bg-primary/10 px-24 py-8 max-md:px-0">
      <div className="flex items-center justify-center max-md:px-4 max-md:text-center">
        <div className="flex w-full flex-col space-y-5 max-md:items-center max-md:justify-center">
          <motion.p
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold"
          >
            <span>{t("title.first")}</span>{" "}
            <span className="text-primary">{t("title.second")}</span>{" "}
            <span>{t("title.third")}</span>{" "}
            <span className="text-primary">{t("title.fourth")}</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-medium text-foreground/70"
          >
            {t("subTitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              asChild
              size={"lg"}
              className="w-fit px-8 text-lg transition-all duration-300 hover:translate-x-4 hover:scale-105"
            >
              <Link href="/search">
                <span>{t("startSearching")}</span> <MoveRight />
              </Link>
            </Button>
          </motion.div>
        </div>
        <div className="w-full max-md:hidden">
          <Image
            src={twoDoctorsImg}
            alt="Researchers collaborating on clinical trials"
            className="drop-shadow-2xl"
          />
        </div>
      </div>
      <SearchForm className="z-10 -mt-10 drop-shadow-xl max-md:mt-10" />
    </section>
  );
}
