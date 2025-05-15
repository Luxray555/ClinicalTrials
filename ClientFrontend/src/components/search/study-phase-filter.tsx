"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

type Props = {
  phase: {
    NA: boolean;
    EARLY_PHASE1: boolean;
    PHASE1: boolean;
    PHASE2: boolean;
    PHASE3: boolean;
    PHASE4: boolean;
  };
  handleCheckboxChange: (
    filterType: "status" | "type" | "phase",
    key: string,
  ) => (checked: boolean) => void;
};

export default function StudyPhaseFilter({
  phase,
  handleCheckboxChange,
}: Props) {
  const t = useTranslations("SearchPage.filtersSideBar");

  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold text-primary">{t("studyPhase.label")}</label>
      <div className="flex flex-col gap-2 pl-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="without-phases"
            checked={phase.NA}
            onCheckedChange={handleCheckboxChange("phase", "NA")}
          />
          <Label
            htmlFor="without-phases"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyPhase.options.na")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="early-phase1"
            checked={phase.EARLY_PHASE1}
            onCheckedChange={handleCheckboxChange("phase", "EARLY_PHASE1")}
          />
          <Label
            htmlFor="early-phase1"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyPhase.options.earlyPhase1")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="phase-1"
            checked={phase.PHASE1}
            onCheckedChange={handleCheckboxChange("phase", "PHASE1")}
          />
          <Label
            htmlFor="phase-1"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyPhase.options.phase1")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="phase-2"
            checked={phase.PHASE2}
            onCheckedChange={handleCheckboxChange("phase", "PHASE2")}
          />
          <Label
            htmlFor="phase-2"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyPhase.options.phase2")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="phase-3"
            checked={phase.PHASE3}
            onCheckedChange={handleCheckboxChange("phase", "PHASE3")}
          />
          <Label
            htmlFor="phase-3"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyPhase.options.phase3")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="phase-4"
            checked={phase.PHASE4}
            onCheckedChange={handleCheckboxChange("phase", "PHASE4")}
          />
          <Label
            htmlFor="phase-4"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyPhase.options.phase4")}
          </Label>
        </div>
      </div>
    </div>
  );
}
