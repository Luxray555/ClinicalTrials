"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

type Props = {
  status: {
    NOT_YET_RECRUITING: boolean;
    RECRUITING: boolean;
    ACTIVE_NOT_RECRUITING: boolean;
    COMPLETED: boolean;
    TERMINATED: boolean;
    ENROLLING_BY_INVITATION: boolean;
    SUSPENDED: boolean;
    WITHDRAWN: boolean;
    UNKNOWN: boolean;
  };
  handleCheckboxChange: (
    filterType: "status" | "type" | "phase",
    key: string,
  ) => (checked: boolean) => void;
};

export default function StatusFilter({ status, handleCheckboxChange }: Props) {
  const t = useTranslations("SearchPage.filtersSideBar");

  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold text-primary">{t("studyStatus.label")}</label>
      <div className="flex flex-col gap-2 pl-2">
        <p className="font-semibold">
          {t("studyStatus.lookingForParticipants")}
        </p>
        <div className="flex items-center gap-2">
          <Checkbox
            id="not-yet-recruiting"
            checked={status.NOT_YET_RECRUITING}
            onCheckedChange={handleCheckboxChange(
              "status",
              "NOT_YET_RECRUITING",
            )}
          />
          <Label
            htmlFor="not-yet-recruiting"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyStatus.options.notYetRecruiting")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="recruiting"
            checked={status.RECRUITING}
            onCheckedChange={handleCheckboxChange("status", "RECRUITING")}
          />
          <Label
            htmlFor="recruiting"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyStatus.options.recruiting")}
          </Label>
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-2">
        <p className="font-semibold">
          {t("studyStatus.noLongerLookingForParticipants")}
        </p>
        <div className="flex items-center gap-2">
          <Checkbox
            id="active-not-recruiting"
            checked={status.ACTIVE_NOT_RECRUITING}
            onCheckedChange={handleCheckboxChange(
              "status",
              "ACTIVE_NOT_RECRUITING",
            )}
          />
          <Label
            htmlFor="active-not-recruiting"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyStatus.options.activeNotRecruiting")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="completed"
            checked={status.COMPLETED}
            onCheckedChange={handleCheckboxChange("status", "COMPLETED")}
          />
          <Label
            htmlFor="completed"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyStatus.options.completed")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="terminated"
            checked={status.TERMINATED}
            onCheckedChange={handleCheckboxChange("status", "TERMINATED")}
          />
          <Label
            htmlFor="terminated"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyStatus.options.terminated")}
          </Label>
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-2">
        <p className="font-semibold">{t("studyStatus.other")}</p>
        <div className="flex items-center gap-2">
          <Checkbox
            id="enrolling-by-invitation"
            checked={status.ENROLLING_BY_INVITATION}
            onCheckedChange={handleCheckboxChange(
              "status",
              "ENROLLING_BY_INVITATION",
            )}
          />
          <Label
            htmlFor="enrolling-by-invitation"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyStatus.options.enrollingByInvitation")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="suspended"
            checked={status.SUSPENDED}
            onCheckedChange={handleCheckboxChange("status", "SUSPENDED")}
          />
          <Label
            htmlFor="suspended"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyStatus.options.suspended")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="withdrawn"
            checked={status.WITHDRAWN}
            onCheckedChange={handleCheckboxChange("status", "WITHDRAWN")}
          />
          <Label
            htmlFor="withdrawn"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyStatus.options.withdrawn")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="unknown"
            checked={status.UNKNOWN}
            onCheckedChange={handleCheckboxChange("status", "UNKNOWN")}
          />
          <Label
            htmlFor="unknown"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("studyStatus.options.unknown")}
          </Label>
        </div>
      </div>
    </div>
  );
}
