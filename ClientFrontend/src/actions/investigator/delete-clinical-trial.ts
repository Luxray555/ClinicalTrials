"use server";
import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { ClinicalTrial } from "@/typings/clinical-trials";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export default async function deleteClinicalTrial(trialId: string) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("Authentication")?.value;

    if (!authCookie) {
      return { error: "Not authenticated" };
    }

    const url = `${API_INFO.BASE_URL}/investigators/clinical-trials/${trialId}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `Authentication=${authCookie}`,
      },
    });

    if (!res.ok) {
      const parsedRes = await res.json();
      return { error: getErrorMessage(parsedRes) };
    }

    const data = await res.json();
    revalidatePath("/my-trials");
    return data as ClinicalTrial;
  } catch (error) {
    console.error("Failed to remove patient", error);
    return {
      error: "Failed to remove patient",
    };
  }
}
