import { serverApiFetch } from "./server-side-api-fetch";

export async function getAllUsers(parmas: { page?: number; pageSize?: number, role?: string }) {
    return await serverApiFetch("/admins/all-users", undefined, {
        page: parmas.page || 1,
        pageSize: parmas.pageSize || 10,
        role: parmas.role || null
    }
    );
}
