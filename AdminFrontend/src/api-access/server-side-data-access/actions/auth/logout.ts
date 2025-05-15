"use server";

import { cookies } from "next/headers";
export async function logout() {

  // Clear the authentication cookies
  try {
    (await cookies()).delete("Authentication");
    (await cookies()).delete("Refresh");
    return { success: true, message: "Logged out successfully" }; // Return success
  } catch (error) {
    return { error: error };
  }
}
