"use server";
import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { Patient } from "@/typings/patients";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

type Props = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  phoneNumber: string;
  postalCode: string;
  healthStatus:
    | "STABLE"
    | "IMPROVING"
    | "DETERIORATING"
    | "CRITICAL"
    | "RECOVERED"
    | "UNDER_TREATMENT"
    | "UNKNOWN";
  medicalHistory: string;
};

export default async function createNewPatient(patientData: Props) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("Authentication")?.value;

    if (!authCookie) {
      return { error: "Not authenticated" };
    }

    const url = `${API_INFO.BASE_URL}/doctors/patients`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `Authentication=${authCookie}`,
      },
      body: JSON.stringify(patientData),
    });

    if (!res.ok) {
      const parsedRes = await res.json();
      return { error: getErrorMessage(parsedRes) };
    }

    const data = await res.json();
    revalidatePath("/patients");
    return data as Patient;
  } catch (error) {
    console.error("Failed to create new patient", error);
    return {
      error: "Failed to create new patient",
    };
  }
}
