import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "Authentication";
export const REFRESH_COOKIE = "Refresh";

export function getAuthCookie(response: Response) {
  const setCookieHeader = response.headers.get("Set-Cookie");
  if (!setCookieHeader) {
    return;
  }
  const accessToken = setCookieHeader
    .split(";")
    .find((cookieHeader) => cookieHeader.includes(AUTH_COOKIE))
    ?.split("=")[1];

  const refreshToken = setCookieHeader
    .split(";")
    .find((cookieHeader) => cookieHeader.includes(REFRESH_COOKIE))
    ?.split("=")[1];

  return {
    accessToken: accessToken && {
      name: AUTH_COOKIE,
      value: accessToken,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      expires: new Date(jwtDecode(accessToken).exp! * 1000),
    },
    refreshToken: refreshToken && {
      name: REFRESH_COOKIE,
      value: refreshToken,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      expires: new Date(jwtDecode(refreshToken).exp! * 1000),
    },
  };
}

export async function setAuthCookie(response: Response) {
  const setCookieHeader = response.headers.get("Set-Cookie");
  if (setCookieHeader) {
    const cookiesArray = setCookieHeader.split(", ");

    const authCookie = cookiesArray.find((cookie) =>
      cookie.startsWith("Authentication="),
    );
    const refreshCookie = cookiesArray.find((cookie) =>
      cookie.startsWith("Refresh="),
    );

    if (authCookie && refreshCookie) {
      const token = authCookie.split(";")[0].split("=")[1];
      const refreshToken = refreshCookie.split(";")[0].split("=")[1];

      (await cookies()).set({
        name: "Authentication",
        value: token,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        expires: new Date(jwtDecode(token).exp! * 1000),
      });

      (await cookies()).set({
        name: "Refresh",
        value: refreshToken,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        expires: new Date(jwtDecode(refreshToken).exp! * 1000),
      });
    } else {
      console.error("Required cookies not found in the Set-Cookie header.");
    }
  }
}

export async function getHeaders() {
  return {
    Cookie: (await cookies()).toString(),
  };
}
