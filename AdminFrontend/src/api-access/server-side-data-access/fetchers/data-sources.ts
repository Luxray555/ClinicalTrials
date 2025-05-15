import { serverApiFetch } from "./server-side-api-fetch";

export async function getAllDataSources(parmas: { page?: number; pageSize?: number }) {
    return await serverApiFetch("/admins/all-data-sources", undefined, {
        page: parmas.page || 1,
        pageSize: parmas.pageSize || 10,
    }
    );
}
