"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function HowItWorksSection() {
  const t = useTranslations("HomePage.HowItWorksSection");

  return (
    <section className="flex w-full flex-col items-center justify-center bg-primary/10 px-24 py-20 max-md:px-8">
      <p className="pb-10 text-4xl font-semibold text-primary">{t("title")}</p>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="relative flex w-full max-md:flex-col"
      >
        <div className="absolute left-1/2 -z-10 h-16 w-8/12 -translate-x-1/2 border-b-4 border-dashed border-primary max-md:hidden"></div>
        <div className="mt-10 flex flex-1 flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
            <p>1</p>
          </div>
          <h2 className="mt-5 font-bold">{t("first.title")}</h2>
          <p className="mt-2 w-2/4 text-center">{t("first.description")}</p>
        </div>
        <div className="mt-10 flex flex-1 flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
            <p>2</p>
          </div>
          <h2 className="mt-5 font-bold">{t("second.title")}</h2>
          <p className="mt-2 w-2/4 text-center">{t("second.description")}</p>
        </div>
        <div className="mt-10 flex flex-1 flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
            <p>3</p>
          </div>
          <h2 className="mt-5 font-bold">{t("third.title")}</h2>
          <p className="mt-2 w-2/4 text-center">{t("third.description")}</p>
        </div>
      </motion.div>
    </section>
  );
}
