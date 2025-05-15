"use server";

import API_INFO from "@/config/api";
import { setAuthCookie } from "@/lib/auth/auth-cookies";
import { SuccessRegisterResponse } from "@/typings/auth";

type RegisterParams = {
  userName?: string;
  email?: string;
  password?: string;
};

export async function register({
  userName,
  email,
  password,
}: RegisterParams) {
  try {
    const res = await fetch(`${API_INFO.BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName,
        email,
        password,
      }),
    });

    const parsedRes = await res.json();

    if (!res.ok) {
      return { error: "Invalid credentials" };
      // return { error: getErrorMessage(parsedRes) };
    }

    await setAuthCookie(res);



    return parsedRes as SuccessRegisterResponse;
  } catch (error) {
    console.error("Failed to register:", error);
    throw new Error("Failed to register. Please try again later.");
  }
}
