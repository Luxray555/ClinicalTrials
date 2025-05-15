"use server";

import API_INFO from "@/config/api";
import { setAuthCookie } from "@/lib/auth/auth-cookies";
import { getErrorMessage } from "@/lib/errors/errors";

type LoginParams = {
  email: string;
  password: string;
};

export default async function login({ email, password }: LoginParams) {
  try {
    const res = await fetch(`${API_INFO.BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const parsedRes = await res.json();
      return { error: getErrorMessage(parsedRes) };
    }

    await setAuthCookie(res);

    return {
      success: "Logged in successfully",
    };
  } catch (error) {
    console.error("Failed to log in:", error);
    throw new Error("Failed to log in. Please try again later.");
  }
}
