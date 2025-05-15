

"use client";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/api-access/server-side-data-access/actions/auth/get-current-user";
import { CurrentUser } from "@/typings/auth";

export function useCurrentUser() {
  const {
    data: currentUser,
    isLoading,
    isFetching,
    refetch: refreshUser,
    isSuccess,
  } = useQuery<CurrentUser | null>({
    queryKey: ["currentUser"], // Unique cache key
    queryFn: async () => {
      const user = await getCurrentUser();
      return "error" in user ? null : (user as CurrentUser);
    },
    staleTime: 1, // Cache user data for 5 min
  });






  return { currentUser, isLoading: isLoading || isFetching, refreshUser };
}
