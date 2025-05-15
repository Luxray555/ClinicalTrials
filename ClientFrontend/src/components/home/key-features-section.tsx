"use client";
import { motion } from "framer-motion";
import {
  DatabaseZap,
  FileLock2,
  Filter,
  Handshake,
  MapPinHouse,
  UserPen,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactElement } from "react";

export default function KeyFeaturesSection() {
  const t = useTranslations("HomePage.KeyFeaturesSection");
  const features: {
    name: string;
    icon: ReactElement;
  }[] = [
    {
      name: t("first"),
      icon: <DatabaseZap size={50} className="text-primary" />,
    },
    {
      name: t("second"),
      icon: <MapPinHouse size={50} className="text-primary" />,
    },
    { name: t("third"), icon: <UserPen size={50} className="text-primary" /> },
    {
      name: t("fourth"),
      icon: <Filter size={50} className="text-primary" />,
    },
    {
      name: t("fifth"),
      icon: <FileLock2 size={50} className="text-primary" />,
    },
    {
      name: t("sixth"),
      icon: <Handshake size={50} className="text-primary" />,
    },
  ] as const;

  return (
    <section className="flex w-full flex-col items-center justify-center px-24 py-20 max-md:px-8">
      <p className="pb-10 text-4xl font-semibold text-primary">{t("title")}</p>
      <ul className="grid grid-cols-3 gap-10 max-md:grid-cols-2 max-sm:grid-cols-1">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            variants={{
              initial: {
                opacity: 0,
                y: 20,
              },
              animate: (index: number) => ({
                opacity: 1,
                y: 0,
                transition: {
                  delay: 0.1 * index,
                },
              }),
            }}
            initial="initial"
            whileInView="animate"
            whileHover={{ scale: 1.05, rotateZ: 2 }}
            custom={index}
            className="flex flex-col items-center justify-between gap-5 rounded-lg bg-primary/10 px-4 py-10 drop-shadow-2xl"
          >
            {feature.icon}
            <span className="text-center text-lg font-medium">
              {feature.name}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
