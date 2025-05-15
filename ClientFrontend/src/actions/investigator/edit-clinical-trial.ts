"use server";
import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { ClinicalTrial } from "@/typings/clinical-trials";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

type Props = {
  trialData: {
    title?: string;
    status?:
      | "COMPLETED"
      | "NOT_YET_RECRUITING"
      | "UNKNOWN"
      | "ACTIVE_NOT_RECRUITING"
      | "WITHDRAWN"
      | "TERMINATED"
      | "RECRUITING"
      | "SUSPENDED"
      | "ENROLLING_BY_INVITATION"
      | "APPROVED_FOR_MARKETING"
      | "NO_LONGER_AVAILABLE"
      | "TEMPORARILY_NOT_AVAILABLE";
    summary?: string;
    currentEnrollmentCount?: number;
    type?: "INTERVENTIONAL" | "OBSERVATIONAL" | "EXPANDED_ACCESS";
    phase?: "NA" | "PHASE1" | "PHASE2" | "PHASE3" | "PHASE4" | "EARLY_PHASE1";
    sponsor?: {
      name: string;
    };
    collaborators?: {
      name: string;
    }[];
    interventions?: {
      name: string;
      description: string;
      type:
        | "DEVICE"
        | "DRUG"
        | "OTHER"
        | "DIAGNOSTIC_TEST"
        | "BIOLOGICAL"
        | "PROCEDURE"
        | "BEHAVIORAL"
        | "DIETARY_SUPPLEMENT"
        | "COMBINATION_PRODUCT"
        | "RADIATION"
        | "GENETIC";
    }[];
    dates?: {
      startDate?: string;
      estimatedCompletionDate?: string;
      firstFetched?: string;
      lastUpdated?: string;
    };
    eligibility?: {
      eligibilityCriteria: string;
      gender: "ALL" | "MALE" | "FEMALE";
      minAge: number;
      maxAge: number;
    };
    conditions?: {
      name: string;
    }[];
    organization?: string;
    locations?: {
      country: string;
      city: string;
      latitude: number;
      longitude: number;
      facility: string;
    }[];
    contacts?: {
      name: string;
      email: string;
      phone: string;
      isMainContact: boolean;
    }[];
  };
  trialId: string;
};

export default async function editClinicalTrial({ trialData, trialId }: Props) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("Authentication")?.value;

    if (!authCookie) {
      return { error: "Not authenticated" };
    }

    const url = `${API_INFO.BASE_URL}/investigators/clinical-trials/${trialId}`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `Authentication=${authCookie}`,
      },
      body: JSON.stringify(trialData),
    });

    if (!res.ok) {
      const parsedRes = await res.json();
      return { error: getErrorMessage(parsedRes) };
    }

    const data = await res.json();
    revalidatePath("/my-trials");
    return data as ClinicalTrial;
  } catch (error) {
    console.error("Failed to update clinical trial", error);
    return {
      error: "Failed to update clinical trial",
    };
  }
}
