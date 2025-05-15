import { cookies } from "next/headers";

export async function getCookies() {
    const cookieStore = cookies();
    const tokenCookie = (await cookieStore).get("Authentication"); // Get only the "token" cookie
    return tokenCookie ? `${tokenCookie.name}=${tokenCookie.value}` : ""; // Return formatted string or empty string if not found
}
