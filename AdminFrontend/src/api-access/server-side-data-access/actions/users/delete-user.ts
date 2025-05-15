'use server';
import { revalidatePath } from "next/cache";
import { apiMutation } from "../api-mutation";

export async function deleteUser(userId: string) {
    const res = await apiMutation(`/admins/delete-user/${userId}`, "DELETE");
    if (!res.error) {
        revalidatePath("/users");
    }
    return res
}
