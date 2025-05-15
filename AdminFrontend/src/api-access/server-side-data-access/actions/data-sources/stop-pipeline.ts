'use server';
import { revalidatePath } from "next/cache";
import { apiMutation } from "../api-mutation";

export async function stopPipeline(sourceSlug: string) {
    const res = await apiMutation(`/etl-pipeline/${sourceSlug}/stop`, "POST");
    if (!res.error) {
        revalidatePath("/data-sources");
    }
    return res
}
