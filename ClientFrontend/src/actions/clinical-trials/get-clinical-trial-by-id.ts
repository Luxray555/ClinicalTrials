"use server";

import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { ClinicalTrial } from "@/typings/clinical-trials";

export default async function getClinicalTrialById(id: string) {
  try {
    const url = `${API_INFO.BASE_URL}/clinical-trials/${id}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const parsedRes = await res.json();
      return { error: getErrorMessage(parsedRes) };
    }

    const data = await res.json();
    return data as ClinicalTrial;
  } catch (error) {
    console.error("Failed to fetch clinical trial:", error);
    return {
      error: "Failed to fetch clinical trial. Please try again later.",
    };
  }
}
