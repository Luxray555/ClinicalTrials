import { withServerError } from "@/lib/errors/errors";
import ServerErrorMessage from "@/components/shared/server-error";
import { getAllUsers } from "@/api-access/server-side-data-access/fetchers/users";
import { UsersDataTable } from "./_components/data-table";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page: number; pageSize: number; role: string }>;
}) {
  const { page, pageSize, role } = await searchParams;
  const response = await withServerError(getAllUsers({ page, pageSize, role }));

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
      <UsersDataTable
        data={response.data.users}
        pagination={response.data.pagination}
      />
    </div>
  );
}
