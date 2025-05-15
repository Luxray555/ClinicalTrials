import { serverApiFetch } from "./server-side-api-fetch";

export async function getAllClinicalTrials(parmas: { page?: number; pageSize?: number, status?: string, sourceName: string | null }) {
    return await serverApiFetch("/clinical-trials", undefined, {
        page: parmas.page || 1,
        itemsPerPage: parmas.pageSize || 10,
        status: parmas.status || null,
        sourceName: parmas.sourceName
    }
    );
}
