"use server";

import { CurrentUser } from "@/typings/auth";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  const authCookie = (await cookies()).get("Authentication")?.value;

  if (!authCookie) {
    return {
      error: "Not authenticated",
    };
  }

  const decodedJwt = jwtDecode(authCookie);

  if (!decodedJwt.exp || decodedJwt.exp * 1000 < Date.now()) {
    return {
      error: "Not authenticated",
    };
  }

  return decodedJwt as CurrentUser;
}
