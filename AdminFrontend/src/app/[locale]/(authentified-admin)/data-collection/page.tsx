import { withServerError } from "@/lib/errors/errors";
import { LogContextsTable } from "../data-sources/[dataSourceId]/_components/history-logs-table";
import ServerErrorMessage from "@/components/shared/server-error";
import { getAllUsers } from "@/api-access/server-side-data-access/fetchers/users";
import { getAllHistoryLogs } from "@/api-access/server-side-data-access/fetchers/get-all-data-collection-logs";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page: number; pageSize: number; type: string }>;
}) {
  const { page, pageSize, type } = await searchParams;
  const response = await withServerError(
    getAllHistoryLogs({ page, pageSize, type }),
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
      <LogContextsTable
        data={response.data.logs}
        pagination={response.data.pagination}
      />
    </div>
  );
}
