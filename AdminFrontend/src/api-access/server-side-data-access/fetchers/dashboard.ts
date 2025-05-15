import { serverApiFetch } from "./server-side-api-fetch";

export async function getSystemStats() {
  return await serverApiFetch("/admins/system-stats");
}
