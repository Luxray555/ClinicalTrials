import React from "react";
import DataSourceDetails from "./_components/data-source-details";
import { withServerError } from "@/lib/errors/errors";
import { getDataSourceDetails } from "@/api-access/server-side-data-access/fetchers/data-source-details";
import ServerErrorMessage from "@/components/shared/server-error";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ dataSourceId: string }>;
  searchParams: Promise<{ page: number; pageSize: number; type: string }>;
}) {
  const { page, pageSize, type } = await searchParams;

  const sourceId = (await params).dataSourceId;
  const response = await withServerError(
    getDataSourceDetails(sourceId, {
      page: page || 1,
      pageSize: pageSize || 10,
      type: type || undefined,
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
    <div className="px-6">
      <DataSourceDetails dataSourceData={response.data} />
    </div>
  );
}
