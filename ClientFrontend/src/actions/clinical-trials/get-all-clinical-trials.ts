"use server";

import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { ClinicalTrial } from "@/typings/clinical-trials";

type ApiResponse = {
  clinicalTrials?: ClinicalTrial[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
  };
};

export default async function getAllClinicalTrials(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  try {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => params.append(key, val));
      } else if (value) {
        params.set(key, value);
      }
    });

    const url = `${API_INFO.BASE_URL}/clinical-trials?${params.toString()}`;

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

    return (await res.json()) as ApiResponse;
  } catch (error) {
    console.error("Failed to fetch clinical trials:", error);
    return {
      error: "Failed to fetch clinical trials. Please try again later.",
    };
  }
}
