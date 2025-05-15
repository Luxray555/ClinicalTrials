import { ApiResponse } from "@/api-access/server-side-data-access/fetchers/server-side-api-fetch";
import ServerErrorMessage from "@/components/shared/server-error";
import { JSX } from "react";

// withServerError.ts
export type ServerErrorResult<T> =
  | { error: true; component: JSX.Element }
  | { error: false; data: T };

export async function withServerError<T>(
  apiCall: Promise<ApiResponse<T>>,
): Promise<any> {
  const response = await apiCall;

  if (!response.success) {
    return {
      error: true,
      component: (
        <ServerErrorMessage
          status={response.status}
          message={response.message}
          error={response.error}
        />
      ),
    };
  }

  return {
    error: false,
    data: response.data,
  };
}
