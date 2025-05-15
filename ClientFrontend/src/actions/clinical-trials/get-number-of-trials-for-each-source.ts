"use server";
import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { cookies } from "next/headers";

export type NumberOfTrialsForEachSourceResponse = {
  source: string;
  count: number;
};

export default async function getNumberOfTrialsForEachSource() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("Authentication")?.value;

    if (!authCookie) {
      return { error: "Not authenticated" };
    }

    const url = `${API_INFO.BASE_URL}/clinical-trials/statistics/trials-number-for-each-source`;

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
    return data as NumberOfTrialsForEachSourceResponse[];
  } catch (error) {
    console.error("Failed to fetch trials number for each source", error);
    return {
      error: "Failed to fetch trials number for each source",
    };
  }
}
