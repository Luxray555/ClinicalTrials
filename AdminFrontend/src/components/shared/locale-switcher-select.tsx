"use client";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { Locale, usePathname, useRouter } from "@/i18n/routing";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  locales: ReadonlyArray<Locale>;
  defaultValue: Locale;
};

export default function LocaleSwitcherSelect({ locales, defaultValue }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  const t = useTranslations("LocaleSwitcher");

  function onSelectChange(nextLocale: Locale) {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale },
      );
    });
  }

  // Ensure the selected locale is always first
  const orderedLocales = [
    defaultValue,
    ...locales.filter((l) => l !== defaultValue),
  ];

  return (
    <Select
      onValueChange={(value) => onSelectChange(value as Locale)}
      disabled={isPending}
      defaultValue={defaultValue}
    >
      <SelectTrigger className="w-16">
        <SelectValue placeholder={t("locale", { locale: defaultValue })} />
      </SelectTrigger>
      <SelectContent className="w-20 min-w-min text-center">
        {orderedLocales.map((cur) => (
          <SelectItem key={cur} value={cur}>
            {t("locale", { locale: cur })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
