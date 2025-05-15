"use client";

import { useTranslations } from "next-intl";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type Props = {
  gender: string;
  handleRadioChange: (value: "ALL" | "MALE" | "FEMALE") => void;
};

export default function GenderFilter({ gender, handleRadioChange }: Props) {
  const t = useTranslations("SearchPage.filtersSideBar");

  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold text-primary">{t("gender.label")}</label>
      <div className="pl-2">
        <RadioGroup
          defaultValue="ALL"
          value={gender}
          onValueChange={handleRadioChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ALL" id="all" />
            <Label htmlFor="all">{t("gender.options.all")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MALE" id="male" />
            <Label htmlFor="male">{t("gender.options.male")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="FEMALE" id="female" />
            <Label htmlFor="female">{t("gender.options.female")}</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
