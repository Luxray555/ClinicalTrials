import { withServerError } from "@/lib/errors/errors";
import ServerErrorMessage from "@/components/shared/server-error";
import { getAllClinicalTrials } from "@/api-access/server-side-data-access/fetchers/clinical-trials";
import ClinicalTrialsTable from "../clinical-trials/_components/data-table";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page: number; pageSize: number; status: string }>;
}) {
  const { page, pageSize, status } = await searchParams;
  const response = await withServerError(
    getAllClinicalTrials({
      page,
      pageSize,
      status,
      sourceName: "From Investigator",
    }),
  );

  if (response.error) {
    return (
      <ServerErrorMessage
        error={response.error}
        status={response.status}
        message={response.message}
      ></ServerErrorMessage>
    );
  }

  return (
    <div className="container mx-auto h-full py-10">
      <ClinicalTrialsTable
        type="INVESTIGATOR"
        data={response.data.clinicalTrials}
        pagination={response.data.pagination}
      />
    </div>
  );
}
