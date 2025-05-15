import {
  Calendar,
  Database,
  Eye,
  File,
  FileType,
  Link,
  PersonStanding,
  StepForward,
} from "lucide-react";
//   import {
//     ClinicalTrialPhase,
//     ClinicalTrialStatus,
//     ClinicalTrialType,
//   } from "@/typings/clinical-trials";
import { cn, getBadgeProps } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Props = {
  status?: any;
  startDate?: string;
  endDate?: string;
  lastUpdatedDate?: string;
  sourceName?: string;
  sourceType?: string;
  originalSourceId?: string;
  originalSourceURL?: string;
  enrollment?: number;
  studyType?: any;
  studyPhase?: any;
};

export default function ClinicalTrialDetailsCard({
  status,
  startDate,
  endDate,
  lastUpdatedDate,
  sourceType,
  sourceName,
  originalSourceId,
  originalSourceURL,
  enrollment,
  studyType,
  studyPhase,
}: Props) {
  const t = useTranslations("ClinicalTrialDetails");

  return (
    // <Card className="custom-scrollbar flex h-[calc(100vh-97px)] w-4/12 flex-col gap-3 border-2 p-4 max-md:h-full max-md:w-full md:m-4 md:overflow-y-scroll">
    <Card className="custom-scrollbar flex h-[calc(100vh-97px)] w-4/12 flex-col gap-3 p-4 max-md:h-full max-md:w-full md:m-4 md:overflow-y-auto">
      <Badge
        variant={getBadgeProps(status).variant}
        className={getBadgeProps(status).className}
      >
        <p className="mx-auto text-center">{status}</p>
      </Badge>

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-black" />
          <strong>{t("sourceName")}</strong>
        </div>
        <p className="ml-6">{sourceName ? sourceName : t("unknownSource")}</p>
      </div>
      <Separator />

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <FileType className="size-4 text-black" />
          <strong>{t("sourceType")}</strong>
        </div>
        <p className="ml-6">{sourceType ? sourceType : t("unknownSource")}</p>
      </div>
      <Separator />

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <File className="size-4 text-black" />
          <strong>{t("originalId")}</strong>
        </div>
        <p className="ml-6">
          {originalSourceId ? originalSourceId : t("unknownId")}
        </p>
      </div>
      <Separator />

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <Link className="size-4 text-black" />
          <strong>{t("studyUrl")}</strong>
        </div>
        <a
          className="ml-6 hover:underline"
          href={originalSourceURL}
          target="_blank"
          rel="noreferrer"
        >
          {originalSourceURL
            ? originalSourceURL.length > 30
              ? originalSourceURL?.slice(0, 30) + " ..."
              : originalSourceURL
            : t("unknownUrl")}
        </a>
      </div>
      <Separator />

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-black" />
          <strong>{t("studyStart")}</strong>
        </div>
        <p className="ml-6">
          {startDate
            ? new Date(startDate).toLocaleDateString()
            : t("unknownDate")}
        </p>
      </div>
      <Separator />

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-black" />
          <strong>{t("studyCompletion")}</strong>
        </div>
        <p className="ml-6">
          {endDate ? new Date(endDate).toLocaleDateString() : t("unknownDate")}
        </p>
      </div>
      <Separator />

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-black" />
          <strong>{t("lastUpdated")}</strong>
        </div>
        <p className="ml-6">
          {lastUpdatedDate
            ? new Date(lastUpdatedDate).toLocaleDateString()
            : t("unknownDate")}
        </p>
      </div>
      <Separator />

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <PersonStanding className="size-4 text-black" />
          <strong>{t("enrollment")}</strong>
        </div>
        <p className="ml-6">
          {enrollment ? enrollment.toLocaleString() : t("unknownEnrollment")}
        </p>
      </div>
      <Separator />

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-black" />
          <strong>{t("studyType")}</strong>
        </div>
        <p className="ml-6">{studyType ? studyType : t("unknownType")}</p>
      </div>
      <Separator />

      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <StepForward className="size-4 text-black" />
          <strong>{t("studyPhase")}</strong>
        </div>
        <p className="ml-6">{studyPhase ? studyPhase : t("unknownPhase")}</p>
      </div>
    </Card>
  );
}
