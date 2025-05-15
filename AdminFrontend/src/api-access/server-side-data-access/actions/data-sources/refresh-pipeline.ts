'use server';
import { revalidatePath } from "next/cache";
import { apiMutation } from "../api-mutation";

export async function refreshDataSource(sourceSlug: string
) {

    const res = await apiMutation(`/etl-pipeline/${sourceSlug}/refresh`, "POST");
    if (!res.error) {
        revalidatePath("/data-sources");
    }
    return res
}
