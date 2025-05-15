import { getClinicalTrialDetails } from "@/api-access/server-side-data-access/fetchers/clinical-trial-details";

import { Badge } from "@/components/ui/badge";
import { FileWarning } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ClinicalTrialDetailsCard from "./_components/details-card";
import ContactCard from "./_components/contacts-card";
import LocationsMap from "./_components/locations-map";
import ServerErrorMessage from "@/components/shared/server-error";
import { withServerError } from "@/lib/errors/errors";
import { Card } from "@/components/ui/card";

type Params = Promise<{ trialId: string }>;

export default async function StudyDetailsPage(props: { params: Params }) {
  const params = await props.params;
  const studyId = params.trialId;
  const t = await getTranslations("ClinicalTrialDetails");

  const response = await withServerError(getClinicalTrialDetails(studyId));

  if (response.error) {
    return (
      <ServerErrorMessage
        error={response.error}
        status={response.status}
        message={response.message}
      ></ServerErrorMessage>
    );
  }

  const clinicalTrial = response.data;

  // const clinicalTrial = await getClinicalTrialDetails(studyId);

  // if ("error" in clinicalTrial) {
  //   return (
  //     <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-4 text-center font-semibold text-primary">
  //       <ShieldX size={40} />
  //       <p>{clinicalTrial.error}</p>
  //     </div>
  //   );
  // }

  return (
    <Suspense fallback={<div>loading</div>}>
      <div className="flex h-full max-md:flex-col max-md:overflow-y-auto">
        <ClinicalTrialDetailsCard
          status={clinicalTrial.status}
          studyType={clinicalTrial.type}
          studyPhase={clinicalTrial.phase}
          startDate={clinicalTrial.dates?.startDate}
          endDate={clinicalTrial.dates?.estimatedCompletionDate}
          lastUpdatedDate={clinicalTrial.dates?.lastUpdated}
          enrollment={clinicalTrial.currentEnrollmentCount}
          originalSourceId={clinicalTrial.sourceMetaData?.originalSourceId}
          originalSourceURL={clinicalTrial.sourceMetaData?.trialSourceUrl}
          sourceName={clinicalTrial.sourceMetaData?.dataSource?.name}
          sourceType={clinicalTrial.sourceMetaData?.dataSource?.type}
        />
        <div className="flex h-[calc(100vh-65px)] w-full flex-col gap-6 p-6 md:overflow-y-auto">
          <p className="text text-xl font-semibold">{t("studyTitle")}</p>

          <p className="text-2xl font-bold">
            {clinicalTrial.title ? clinicalTrial.title : "No title provided"}
          </p>
          <div className="flex flex-col gap-2">
            <p className="text text-xl font-semibold">{t("studySummary")}</p>
            <p className="text-justify">
              {clinicalTrial.summary ? clinicalTrial.summary : t("noSummary")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text text-xl font-semibold">{t("conditions")}</p>
            <div className="flex flex-wrap items-center gap-4">
              {clinicalTrial.conditions
                ? clinicalTrial.conditions?.map((condition, index) => (
                    <Badge
                      className="w-fit rounded-md bg-primary text-sm text-background"
                      variant="outline"
                      key={index}
                    >
                      {condition.name}
                    </Badge>
                  ))
                : t("noConditions")}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text text-xl font-semibold">{t("interventions")}</p>
            <div className="flex flex-wrap items-center gap-4">
              {clinicalTrial.interventions?.map((intervention, index) => (
                <Badge
                  className="w-fit rounded-md bg-primary text-sm text-background"
                  variant="outline"
                  key={index}
                >
                  {intervention.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text text-xl font-semibold">
              {t("interventionsUsage")}
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              {clinicalTrial.interventions?.map((intervention, index) => (
                <li key={index}>
                  <strong>- {intervention.name}</strong>:{" "}
                  {intervention.description}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text text-xl font-semibold">
              {t("participationCriteria")}
            </p>
            <div className="flex gap-4 max-md:flex-col">
              <p className="w-full text-justify">
                {clinicalTrial.eligibility?.eligibilityCriteria
                  ? clinicalTrial.eligibility?.eligibilityCriteria
                  : t("noEligibilityCriteria")}
              </p>
              <Card className="flex h-fit w-3/12 flex-col flex-wrap gap-2 p-4 max-md:w-full">
                <p>
                  <strong>{t("gender")}:</strong>{" "}
                  {clinicalTrial.eligibility?.gender}
                </p>
                {clinicalTrial.eligibility?.minAge && (
                  <p>
                    <strong>{t("minAge")}:</strong>
                    {clinicalTrial.eligibility?.minAge} {t("years")}
                  </p>
                )}
                {clinicalTrial.eligibility?.maxAge && (
                  <p>
                    <strong>{t("maxAge")}:</strong>
                    {clinicalTrial.eligibility?.maxAge} {t("years")}
                  </p>
                )}
              </Card>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text text-xl font-semibold">
              {t("collaboratorsAndInvestigators")}
            </p>
            <div className="ml-4 flex flex-col gap-2">
              <div>
                <strong>- {t("sponsor")}</strong>
                {
                  <p className="ml-2">
                    {clinicalTrial.sponsor?.name
                      ? clinicalTrial.sponsor?.name
                      : t("noSponsor")}
                  </p>
                }
              </div>
              <div>
                <strong>- {t("collaborators")}</strong>
                <ul className="ml-2">
                  {clinicalTrial.collaborators?.length &&
                  clinicalTrial.collaborators?.length > 0 ? (
                    clinicalTrial.collaborators?.map((collaborator, index) => (
                      <li key={index}>{collaborator.name}</li>
                    ))
                  ) : (
                    <li>
                      <p>{t("noCollaborators")}</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text text-xl font-semibold">
              {t("contactsAndLocations")}
            </p>
            <div className="flex min-h-80 flex-col gap-2">
              <div className="flex h-full gap-4 max-md:flex-col">
                <div className="flex w-full flex-wrap gap-4 border border-primary p-4 font-medium">
                  {clinicalTrial.contacts?.length &&
                  clinicalTrial.contacts?.length > 0 ? (
                    clinicalTrial.contacts?.map((contact, index) => (
                      <ContactCard
                        key={index}
                        name={contact.name}
                        email={contact.email}
                        phone={contact.phone}
                      />
                    ))
                  ) : (
                    <div className="flex w-full flex-col items-center justify-center gap-2 text-primary">
                      <FileWarning size={25} />
                      <p>{t("noContacts")}</p>
                    </div>
                  )}
                </div>
                <div className="w-full border border-primary max-md:h-full">
                  <LocationsMap locations={clinicalTrial.locations!} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
