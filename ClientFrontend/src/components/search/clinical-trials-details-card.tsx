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
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  ClinicalTrialPhase,
  ClinicalTrialStatus,
  ClinicalTrialType,
} from "@/typings/clinical-trials";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
  status?: ClinicalTrialStatus;
  startDate?: string;
  endDate?: string;
  lastUpdatedDate?: string;
  sourceName?: string;
  sourceType?: string;
  originalSourceId?: string;
  originalSourceURL?: string;
  enrollment?: number;
  studyType?: ClinicalTrialType;
  studyPhase?: ClinicalTrialPhase;
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
    <div className="custom-scrollbar flex h-[calc(100vh-97px)] w-4/12 flex-col gap-3 border-2 p-4 max-md:h-full max-md:w-full md:m-4 md:overflow-y-scroll">
      <Badge
        className={cn("w-fit bg-green-600 px-6 text-sm text-background", {
          "bg-teal-600 hover:bg-teal-700":
            status === "COMPLETED" || status === "APPROVED_FOR_MARKETING",
          "bg-green-600 hover:bg-green-700":
            status === "RECRUITING" || status === "ENROLLING_BY_INVITATION",
          "bg-orange-500 hover:bg-orange-600":
            status === "NOT_YET_RECRUITING" ||
            status === "ACTIVE_NOT_RECRUITING",
          "bg-red-600 hover:bg-red-700":
            status === "TERMINATED" || status === "WITHDRAWN",
          "bg-gray-500 hover:bg-gray-600":
            status === "NO_LONGER_AVAILABLE" ||
            status === "TEMPORARILY_NOT_AVAILABLE",
          "bg-yellow-500 hover:bg-yellow-600": status === "SUSPENDED",
          "bg-gray-700 hover:bg-gray-800": status === "UNKNOWN",
        })}
        variant="outline"
      >
        {status?.split("_").join(" ")}
      </Badge>
      <div className="flex gap-2">
        <Database className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("sourceName")}</strong>
          <p>{sourceName ? sourceName : t("unknownSource")}</p>
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        <FileType className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("sourceType")}</strong>
          <p>{sourceType ? sourceType : t("unknownSource")}</p>
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        <File className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("originalId")}</strong>
          <p>{originalSourceId ? originalSourceId : t("unknownId")}</p>
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        <Link className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("studyUrl")}</strong>
          <a
            className="hover:underline"
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
      </div>
      <Separator />
      <div className="flex gap-2">
        <Calendar className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("studyStart")}</strong>
          <p>
            {startDate
              ? new Date(startDate).toLocaleDateString()
              : t("unknownDate")}
          </p>
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        <Calendar className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("studyCompletion")}</strong>
          <p>
            {endDate
              ? new Date(endDate).toLocaleDateString()
              : t("unknownDate")}
          </p>
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        <Calendar className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("lastUpdated")}</strong>
          <p>
            {lastUpdatedDate
              ? new Date(lastUpdatedDate).toLocaleDateString()
              : t("unknownDate")}
          </p>
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        <PersonStanding className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("enrollment")}</strong>
          <p>
            {enrollment ? enrollment.toLocaleString() : t("unknownEnrollment")}
          </p>
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        <Eye className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("studyType")}</strong>
          <p>{studyType ? studyType : t("unknownType")}</p>
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        <StepForward className="text-primary" />
        <div className="flex flex-col items-start justify-center gap-2">
          <strong>{t("studyPhase")}</strong>
          <p>{studyPhase ? studyPhase : t("unknownPhase")}</p>
        </div>
      </div>
      <Separator />
    </div>
  );
}
