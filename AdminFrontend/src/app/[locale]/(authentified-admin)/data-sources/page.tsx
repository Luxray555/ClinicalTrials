import { withServerError } from "@/lib/errors/errors";
import ServerErrorMessage from "@/components/shared/server-error";
import { getAllDataSources } from "@/api-access/server-side-data-access/fetchers/data-sources";
import { DataSourcesTable } from "./_components/data-table";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page: number; pageSize: number }>;
}) {
  const { page, pageSize } = await searchParams;
  const response = await withServerError(getAllDataSources({ page, pageSize }));

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
      <DataSourcesTable
        data={response.data.dataSources}
        pagination={response.data.pagination}
      />
    </div>
  );
}
