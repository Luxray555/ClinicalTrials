'use server';
import { revalidatePath } from "next/cache";
import { apiMutation } from "../api-mutation";

export async function deleteClinicalTrial(trialId: string) {
    const res = await apiMutation(`/admins/delete-trial/${trialId}`, "DELETE");
    if (!res.error) {
        revalidatePath("/clinical-trials");
    }
    return res
}
