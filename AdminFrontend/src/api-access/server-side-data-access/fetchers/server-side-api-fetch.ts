import "server-only";
import API_INFO from "@/config/api";
import { getCookies } from "@/lib/auth/get-cookies";
import { redirect } from "next/navigation";

// Response type for successful API calls
export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  [key: string]: any; // For any additional fields in the response
}

// Response type for failed API calls
export interface ApiErrorResponse {
  success: false;
  status: number;
  message: string;
  error: string;
  data?: any;
}

// Combined response type
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// NextJS fetch options type
interface NextFetchOptions {
  revalidate?: number;
  tags?: string[];
}

/**
 * Server-side API fetch function
 * 
 * @param endpoint - API endpoint path
 * @param body - Optional request body
 * @param params - Optional query parameters
 * @param next - Next.js cache/revalidation options
 * @returns A promise resolving to ApiResponse
 */
export async function serverApiFetch<T = any>(
  endpoint: string,
  body?: any,
  params?: { [key: string]: string | number },
  next?: NextFetchOptions
): Promise<ApiResponse<T>> {
  const cookieHeader = await getCookies();
  if (!cookieHeader) redirect("/auth/login")


  try {
    // Construct query parameters if any
    const queryParams = params
      ? `?${new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString()}`
      : "";


    const res = await fetch(`${API_INFO.BASE_URL}${endpoint}${queryParams}`, {
      method: "GET", // You can modify this to other methods as needed
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}), // Include cookie if available
      },
      body: body ? JSON.stringify(body) : undefined, // Add body only if it's provided
      // Here we include the `next` object for revalidation
      next
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
      data: jsonResponse
    } as ApiSuccessResponse<T>;
  } catch (error) {
    console.error("API Request Failed:", error);
    // Return a consistent error structure even for network errors
    return {
      success: false,
      status: 500,
      message: "Something went wrong. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}