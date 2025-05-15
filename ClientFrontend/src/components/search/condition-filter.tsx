"use client";

import { useTranslations } from "next-intl";
import { Input } from "../ui/input";

type Props = {
  condition: string;
  handleConditionChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export default function ConditionFilter({
  condition,
  handleConditionChange,
}: Props) {
  const t = useTranslations("SearchPage.filtersSideBar");
  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold text-primary" htmlFor="condition">
        {t("condition.label")}
      </label>
      <Input
        value={condition}
        onChange={handleConditionChange}
        type="text"
        id="condition"
        placeholder={t("condition.placeholder")}
      />
    </div>
  );
}
