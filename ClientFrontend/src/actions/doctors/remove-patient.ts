"use server";

import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { Patient } from "@/typings/patients";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export default async function removePatient(patientId: string) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("Authentication")?.value;

    if (!authCookie) {
      return { error: "Not authenticated" };
    }

    const url = `${API_INFO.BASE_URL}/doctors/patients/${patientId}`;

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
    revalidatePath("/patients");
    return data as Patient;
  } catch (error) {
    console.error("Failed to remove patient", error);
    return {
      error: "Failed to remove patient",
    };
  }
}
