"use server";

import { cookies } from "next/headers";

export async function logout() {
  try {
    (await cookies()).delete("Authentication");
    (await cookies()).delete("Refresh");

    return {
      success: "Logged out successfully",
    };
  } catch (error) {
    return { error: error };
  }
}
