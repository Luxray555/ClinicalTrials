"use server";
import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";

export default async function getAllCitiesByCountry(countryName: string) {
  try {
    const url = `${API_INFO.BASE_URL}/clinical-trials/cities?country=${countryName}`;

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
    return data as string[];
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    return {
      error: "Failed to fetch cities. Please try again later.",
    };
  }
}
