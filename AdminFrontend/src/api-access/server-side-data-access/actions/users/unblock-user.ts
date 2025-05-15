'use server';
import { revalidatePath } from "next/cache";
import { apiMutation } from "../api-mutation";

export async function unblockUser(userId: string) {
    const res = await apiMutation(`/admins/unblock-user/${userId}`, "PATCH");
    if (!res.error) {
        revalidatePath("/users");
    }
    return res

}


