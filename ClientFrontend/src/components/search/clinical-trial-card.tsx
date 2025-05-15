import { Calendar, MapPin, ShieldX, UserRound } from "lucide-react";
import { TbGenderBigender } from "react-icons/tb";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Link } from "@/i18n/routing";
import getClinicalTrialById from "@/actions/clinical-trials/get-clinical-trial-by-id";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export default async function ClinicalTrialCard({
  trialId,
}: {
  trialId: string;
}) {
  const clinicalTrial = await getClinicalTrialById(trialId);
  const t = await getTranslations("ClinicalTrialCard");

  if ("error" in clinicalTrial) {
    return (
      <div className="mt-20 flex flex-col items-center justify-center gap-4 text-center font-semibold text-primary">
        <ShieldX size={40} />
        <p>{clinicalTrial.error}</p>
      </div>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="p-4">
        <CardTitle className="cursor-pointer hover:underline">
          <Link href={`/studies/${trialId}`}>{clinicalTrial.title}</Link>
        </CardTitle>
        <CardDescription>
          <Badge
            className={cn("text-background", {
              "bg-teal-600 hover:bg-teal-700":
                clinicalTrial.status === "COMPLETED" ||
                clinicalTrial.status === "APPROVED_FOR_MARKETING",
              "bg-green-600 hover:bg-green-700":
                clinicalTrial.status === "RECRUITING" ||
                clinicalTrial.status === "ENROLLING_BY_INVITATION",
              "bg-orange-500 hover:bg-orange-600":
                clinicalTrial.status === "NOT_YET_RECRUITING" ||
                clinicalTrial.status === "ACTIVE_NOT_RECRUITING",
              "bg-red-600 hover:bg-red-700":
                clinicalTrial.status === "TERMINATED" ||
                clinicalTrial.status === "WITHDRAWN",
              "bg-gray-500 hover:bg-gray-600":
                clinicalTrial.status === "NO_LONGER_AVAILABLE" ||
                clinicalTrial.status === "TEMPORARILY_NOT_AVAILABLE",
              "bg-yellow-500 hover:bg-yellow-600":
                clinicalTrial.status === "SUSPENDED",
              "bg-gray-700 hover:bg-gray-800":
                clinicalTrial.status === "UNKNOWN",
            })}
            variant="outline"
          >
            {clinicalTrial.status?.split("_").join(" ")}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <div className="flex flex-col">
          <p className="font-semibold text-foreground/70">{t("conditions")}</p>
          <Separator className="mb-2 mt-1" />
          <div className="flex flex-wrap gap-2">
            {clinicalTrial.conditions?.map((condition, index) => (
              <Badge
                key={index}
                className="w-fit rounded-md bg-primary text-sm text-background"
                variant="outline"
              >
                {condition.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="font-semibold text-foreground/70">{t("details")}</p>
          <Separator className="mb-2 mt-1" />
          <div className="flex flex-wrap items-center gap-4">
            {clinicalTrial.locations?.length &&
            clinicalTrial.locations?.length > 0 ? (
              <div className="flex items-center gap-2">
                <MapPin className="text-primary" />
                <p className="text-wrap">
                  {Array.from(
                    new Set(
                      clinicalTrial.locations?.map(
                        (location) => location.country,
                      ),
                    ),
                  )
                    .slice(0, 10)
                    .join(", ")}
                </p>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <TbGenderBigender size={28} className="text-primary" />
              <p>
                {clinicalTrial.eligibility
                  ? clinicalTrial.eligibility.gender
                  : t("unknownGender")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <UserRound className="text-primary" />
              <p>
                {clinicalTrial.eligibility?.minAge &&
                clinicalTrial.eligibility?.maxAge
                  ? `${t("between")} ${clinicalTrial.eligibility?.minAge} ${t("and")} 
                  ${clinicalTrial.eligibility?.maxAge} ${t("years")}`
                  : clinicalTrial.eligibility?.minAge &&
                      !clinicalTrial.eligibility?.maxAge
                    ? `${t("over")} ${clinicalTrial.eligibility?.minAge} ${t("years")}`
                    : clinicalTrial.eligibility?.maxAge &&
                        !clinicalTrial.eligibility?.minAge
                      ? `${t("under")} ${clinicalTrial.eligibility?.maxAge} ${t("years")}`
                      : t("unknownAge")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-primary" />
              <p>
                {clinicalTrial.dates?.startDate &&
                clinicalTrial.dates?.estimatedCompletionDate
                  ? `${t("between")} ${new Date(
                      clinicalTrial.dates?.startDate,
                    ).toLocaleDateString()} ${t("and")} ${new Date(
                      clinicalTrial.dates?.estimatedCompletionDate,
                    ).toLocaleDateString()}`
                  : clinicalTrial.dates?.startDate &&
                      !clinicalTrial.dates?.estimatedCompletionDate
                    ? `${t("startingOn")} ${new Date(
                        clinicalTrial.dates?.startDate,
                      ).toLocaleDateString()}`
                    : clinicalTrial.dates?.estimatedCompletionDate &&
                        !clinicalTrial.dates?.startDate
                      ? `${t("endingOn")} ${new Date(
                          clinicalTrial.dates?.estimatedCompletionDate,
                        ).toLocaleDateString()}`
                      : t("unknownDates")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
