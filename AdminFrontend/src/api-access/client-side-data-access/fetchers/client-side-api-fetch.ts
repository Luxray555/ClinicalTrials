import { ApiResponse, ApiSuccessResponse } from "@/api-access/server-side-data-access/fetchers/server-side-api-fetch";
import API_INFO from "@/config/api";

export async function clientApiFetch<T = any>(
    endpoint: string,
    body?: any,
    params?: { [key: string]: string | number },
    // next?: any
): Promise<ApiResponse<T>> {

    try {

        // Construct query parameters if any
        const queryParams = params
            ? `?${new URLSearchParams(
                Object.entries(params).reduce((acc, [key, value]) => {
                    acc[key] = String(value);
                    return acc;
                }, {} as Record<string, string>)
            ).toString()}`
            : "";


        const res = await fetch(`${API_INFO.BASE_URL}${endpoint}${queryParams}`, {
            method: "GET", // You can modify this to other methods as needed
            headers: {
                "Content-Type": "application/json",
                // ...(cookieHeader ? { Cookie: cookieHeader } : {}), // Include cookie if available
            },
            credentials: "include", // Include credentials for cross-origin requests
            body: body ? JSON.stringify(body) : undefined, // Add body only if it's provided
            // Here we include the `next` object for revalidation
            // next
        });

        const jsonResponse = await res.json();

        if (!res.ok) {
            // Return a structured error object
            return {
                success: false,
                status: res.status,
                message: jsonResponse.message || "An error occurred",
                error: jsonResponse.error || "Request failed"
            };
        }

        return {
            success: true,
            ...jsonResponse
        } as ApiSuccessResponse<T>;

    } catch (error) {
        return {
            success: false,
            status: 500,
            message: "Something went wrong. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}


// what i need , 