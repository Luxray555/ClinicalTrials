import { serverApiFetch } from "./server-side-api-fetch";

export async function getDataSourceDetails(sourceId: string, params: any) {
    return await serverApiFetch("/admins/data-sources/" + sourceId, undefined, {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        type: params.type || undefined,
    }
    );
}
