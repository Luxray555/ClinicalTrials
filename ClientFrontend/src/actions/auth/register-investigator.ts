"use server";

import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { Gender, SuccessInvestigatorRegisterResponse } from "@/typings/auth";

type RegisterParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: Gender;
  institution: string;
  institutionAddress: string;
  institutionContactNumber: string;
  investigatorRole: string;
};

export async function registerInvestigator({
  firstName,
  lastName,
  email,
  password,
  gender,
  institution,
  institutionAddress,
  institutionContactNumber,
  investigatorRole,
}: RegisterParams) {
  try {
    const res = await fetch(`${API_INFO.BASE_URL}/auth/register-investigator`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        gender,
        institution,
        institutionAddress,
        institutionContactNumber,
        investigatorRole,
      }),
    });

    const parsedRes = await res.json();

    if (!res.ok) {
      return { error: getErrorMessage(parsedRes) };
    }

    return parsedRes as SuccessInvestigatorRegisterResponse;
  } catch (error) {
    console.error("Failed to register:", error);
    throw new Error("Failed to register. Please try again later.");
  }
}
