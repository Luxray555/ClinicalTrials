import { serverApiFetch } from "./server-side-api-fetch";

export async function getClinicalTrialDetails(trialId: string) {
    return await serverApiFetch("/clinical-trials/" + trialId)
}
