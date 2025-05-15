"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

type Props = {
  type: {
    INTERVENTIONAL: boolean;
    OBSERVATIONAL: boolean;
    EXPANDED_ACCESS: boolean;
  };
  handleCheckboxChange: (
    filterType: "status" | "type" | "phase",
    key: string,
  ) => (checked: boolean) => void;
};

export default function StudyTypeFilter({ type, handleCheckboxChange }: Props) {
  const t = useTranslations("SearchPage.filtersSideBar");

  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold text-primary">{t("studyType.label")}</label>
      <div className="flex flex-col gap-2 pl-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="interventional"
            checked={type.INTERVENTIONAL}
            onCheckedChange={handleCheckboxChange("type", "INTERVENTIONAL")}
          />
          <Label
            htmlFor="interventional"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyType.options.interventional")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="observational"
            checked={type.OBSERVATIONAL}
            onCheckedChange={handleCheckboxChange("type", "OBSERVATIONAL")}
          />
          <Label
            htmlFor="observational"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyType.options.observational")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="expanded-access"
            checked={type.EXPANDED_ACCESS}
            onCheckedChange={handleCheckboxChange("type", "EXPANDED_ACCESS")}
          />
          <Label
            htmlFor="expanded-access"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyType.options.expandedAccess")}
          </Label>
        </div>
      </div>
    </div>
  );
}
