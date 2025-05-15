'use server';
import { revalidatePath } from "next/cache";
import { apiMutation } from "../api-mutation";

export async function updateDataSourceSchedule(sourceId: string, schedule:
    {
        frequency?: string;
        dayOfWeek?: string;
        dayOfMonth?: string;
        timeOfDay?: string;
    }
) {


    const res = await apiMutation(`/admins/data-sources/${sourceId}/schedule`, "PATCH", schedule);
    if (!res.error) {
        revalidatePath("/data-sources");
    }
    return res
}
