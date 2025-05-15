'use server';
import { revalidatePath } from "next/cache";
import { apiMutation } from "../api-mutation";

export async function runPipeline(sourceSlug: string, runPipelineDto: any
    // {
    //     numberOfTrials: number,
    //     startingFrom: number,
    //     status: [],
    //     //   startYear: new Date().getFullYear() - 5,
    //     //   endYear: new Date().getFullYear(),
    //     //   country: undefined,
    //     //   conditions: [],
    // }
) {

    const res = await apiMutation(`/etl-pipeline/${sourceSlug}/run`, "POST", runPipelineDto);
    if (!res.error) {
        revalidatePath("/data-sources");
    }
    return res
}
