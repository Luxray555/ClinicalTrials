"use server";

import API_INFO from "@/config/api";
import { getErrorMessage } from "@/lib/errors/errors";
import { Gender, SuccessDoctorRegisterResponse } from "@/typings/auth";

type RegisterParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  hospital: string;
  gender: Gender;
  speciality: string;
  medicalLicenseNumber: string;
  phoneNumber: string;
  address: string;
};

export async function registerDoctor({
  firstName,
  lastName,
  email,
  password,
  gender,
  hospital,
  address,
  medicalLicenseNumber,
  phoneNumber,
  speciality,
}: RegisterParams) {
  try {
    const res = await fetch(`${API_INFO.BASE_URL}/auth/register-doctor`, {
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
        hospital,
        address,
        medicalLicenseNumber,
        phoneNumber,
        speciality,
      }),
    });

    const parsedRes = await res.json();

    if (!res.ok) {
      return { error: getErrorMessage(parsedRes) };
    }

    return parsedRes as SuccessDoctorRegisterResponse;
  } catch (error) {
    console.error("Failed to register:", error);
    throw new Error("Failed to register. Please try again later.");
  }
}
