"use client";
import { logout } from "@/api-access/server-side-data-access/actions/auth/logout";
import { useGlobalApp } from "@@/providers/app-global-context-provider";
import { LogOut } from "lucide-react";
import React from "react";
import { useTranslations } from "next-intl"; // Import the hook

// Define props type if needed, though simple here
interface LogoutProps {
  showText: boolean;
}

function Logout({ showText }: LogoutProps) {
  const { executeServerAction } = useGlobalApp();

  const t = useTranslations("Logout"); // Initialize translations with a namespace

  const handleLogoutClick = async () => {
    const res = await executeServerAction(
      () => logout(),
      {
        success: t("toastSuccess"), // Translated toast message
      },
      {
        title: t("confirmTitle"), // Translated confirmation title
        message: t("confirmMessage"), // Translated confirmation message
        confirmButtonText: t("confirmButton"), // Translated confirmation button text
      },
    );

    console.log("res", res);
    if (res.success) window.location.href = "/auth/login";
  };

  return (
    <div
      className="flex cursor-pointer items-center justify-center gap-5 hover:opacity-80" // Use opacity for hover effect
      onClick={handleLogoutClick} // Call the handler function
      role="button" // Add role for accessibility
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleLogoutClick();
      }} // Allow activation with keyboard
      aria-label={t("ariaLabel")} // Add aria-label for screen readers
    >
      {showText && <span className="text-red-500">{t("buttonText")}</span>}{" "}
      {/* Translated text */}
      <LogOut
        className="h-4 w-4 text-red-500" // Matched color with text
        aria-hidden="true" // Hide decorative icon from screen readers if text or aria-label is present
      />
    </div>
  );
}

export default Logout;
