import { getCurrentUser } from "@/actions/auth/get-current-user";
import { CurrentUser } from "@/typings/auth";
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const user = await getCurrentUser();

        if ("error" in user) {
          setCurrentUser(null);
        } else {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

  return [currentUser];
}
