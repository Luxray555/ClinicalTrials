import { useLocale } from "next-intl";
import { Locale, routing } from "@/i18n/routing";
import LocaleSwitcherSelect from "./locale-switcher-select";

export default function LocaleSwitcher() {
  const locale: Locale = useLocale() as Locale;

  return (
    <LocaleSwitcherSelect defaultValue={locale} locales={routing.locales} />
  );
}
