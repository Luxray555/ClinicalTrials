"use server";
import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { ClinicalTrial } from "@/typings/clinical-trials";
import { cookies } from "next/headers";

export default async function getAllClinicalTrials() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("Authentication")?.value;

    if (!authCookie) {
      return { error: "Not authenticated" };
    }

    const url = `${API_INFO.BASE_URL}/investigators/clinical-trials`;

    const res = await fetch(url, {
      method: "GET",
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
    return data as ClinicalTrial[];
  } catch (error) {
    console.error("Failed to fetch all clinical trials", error);
    return {
      error: "Failed to fetch all clinical trials",
    };
  }
}
