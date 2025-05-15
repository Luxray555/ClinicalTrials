"use server";

import API_INFO from "@/config/api";
import { getCookies } from "@/lib/auth/get-cookies";


export async function apiMutation(
    endpoint: string,
    method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
    body?: any
) {
    const cookieHeader = await getCookies();

    try {
        const res = await fetch(`${API_INFO.BASE_URL}${endpoint}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        let jsonRes: any = null;

        try {
            jsonRes = await res.json();
        } catch (jsonErr) {
            console.log('jsonErr', jsonErr)
            // Response is not JSON
        }

        if (!res.ok) {
            return {
                error: true,
                status: res.status,
                message:
                    jsonRes?.message ||
                    res.statusText ||
                    "An error occurred while processing your request.",
                data: jsonRes ?? null,
            };
        }


        return jsonRes ? { success: true, ...jsonRes } : { success: true };
    } catch (error: any) {
        console.error("API Request Failed:", error);
        return {
            error: true,
            status: 500,
            message: "Failed to fetch. Something went wrong.",
        };
    }
}
