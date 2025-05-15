'use server';
import { revalidatePath } from "next/cache";
import { apiMutation } from "../api-mutation";

export async function blockUser(userId: string) {
    const res = await apiMutation(`/admins/block-user/${userId}`, "PATCH");
    if (!res.error) {
        revalidatePath("/users");
    }
    return res
}
