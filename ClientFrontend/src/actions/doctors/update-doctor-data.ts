"use server";

import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { Doctor } from "@/typings/doctors";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

type Props = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  gender?: "MALE" | "FEMALE";
  speciality?: string;
  hospital?: string;
  image?: string;
};

export default async function updateDoctorData(doctorData: Props) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("Authentication")?.value;

    if (!authCookie) {
      return { error: "Not authenticated" };
    }

    const url = `${API_INFO.BASE_URL}/doctors/me`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `Authentication=${authCookie}`,
      },
      body: JSON.stringify(doctorData),
    });

    if (!res.ok) {
      const parsedRes = await res.json();
      return { error: getErrorMessage(parsedRes) };
    }

    const data = await res.json();
    revalidatePath("/settings");
    return data as Doctor;
  } catch (error) {
    console.error("Failed to update doctor data", error);
    return {
      error: "Failed to update doctor data",
    };
  }
}
