"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

type ToastConfig = boolean | { success?: string; error?: string };

interface ConfirmationConfig {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

interface ActionResultConfig {
  success: boolean;
  message: string;
}

// Type for the state holding pending action info
interface PendingActionInfo {
  action: () => Promise<any>;
  toastConfig: ToastConfig;
  // Add resolve/reject functions to link back to executeServerAction's promise
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

interface GlobalAppContextType {
  isConfirmationModalOpen: boolean;
  confirmationConfig: ConfirmationConfig;
  // No need to expose pendingActionInfo directly

  // showConfirmation becomes internal detail, triggered by executeServerAction
  // showConfirmation: ( ... ) => void;

  executeAction: () => Promise<any>; // Called by modal confirm button
  cancelAction: () => void; // Called by modal cancel button
  showResult: (result: ActionResultConfig) => void; // For manual toasts

  executeServerAction: (
    // The primary function called by components
    action: () => Promise<any>,
    toastConfig?: ToastConfig,
    confirmConfig?: {
      title: string;
      message: string;
      confirmButtonText?: string;
    },
  ) => Promise<any>;
}

const defaultConfirmationConfig: ConfirmationConfig = {
  title: "Confirm Action",
  message: "Are you sure you want to proceed with this action?",
  confirmButtonText: "Confirm",
  cancelButtonText: "Cancel",
};

const GlobalAppContext = createContext<GlobalAppContextType | undefined>(
  undefined,
);

export const GlobalAppProvider = ({ children }: { children: ReactNode }) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] =
    useState<ConfirmationConfig>(defaultConfirmationConfig);

  // State holds the action, toast config, and promise handlers
  const [pendingActionInfo, setPendingActionInfo] =
    useState<PendingActionInfo | null>(null);

  // Internal helper to actually show the modal and store action details
  const showConfirmationInternal = (
    config: Partial<ConfirmationConfig>,
    action: () => Promise<any>,
    toastConfig: ToastConfig = true,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
  ) => {
    setConfirmationConfig({ ...defaultConfirmationConfig, ...config });
    setPendingActionInfo({ action, toastConfig, resolve, reject }); // Store everything
    setIsConfirmationModalOpen(true);
  };

  // This function is called by the modal's CONFIRM button
  const executeAction = async () => {
    if (!pendingActionInfo) return Promise.resolve(null); // Should not happen if modal is open

    // Destructure ALL info needed
    const { action, toastConfig, resolve, reject } = pendingActionInfo;

    // Clear state immediately to prevent double execution
    setPendingActionInfo(null);
    setIsConfirmationModalOpen(false);

    let result: any = null;
    let error: any = null;

    try {
      console.log("Modal confirmed, executing pending action...");
      result = await action(); // Execute the actual original action (e.g., logout)
      console.log("Pending action finished, result:", result);

      // --- Toast logic for confirmed action ---
      if (toastConfig) {
        const successMsg =
          typeof toastConfig === "object" && toastConfig.success
            ? toastConfig.success
            : result?.message || "Action completed successfully";

        if (
          result?.success === true ||
          (result?.success === undefined && !result?.error)
        ) {
          console.log("Confirmed action successful, showing success toast.");
          toast.success(successMsg);
        } else {
          const errorMsg =
            typeof toastConfig === "object" && toastConfig.error
              ? toastConfig.error
              : result?.message || result?.data?.message || "Action failed";
          console.log("Confirmed action failed, showing error toast.");
          toast.error(errorMsg);
        }
      }
      // ----------------------------------------

      resolve(result); // IMPORTANT: Resolve the promise returned by executeServerAction
    } catch (err: any) {
      error = err;
      console.error("Error during confirmed action execution:", err);
      // --- Toast logic for caught errors ---
      if (toastConfig) {
        const errorMsg =
          typeof toastConfig === "object" && toastConfig.error
            ? toastConfig.error
            : err?.message || "An unexpected error occurred";
        console.log("Confirmed action caught error, showing error toast.");
        toast.error(errorMsg);
      }
      // ------------------------------------
      reject(err); // IMPORTANT: Reject the promise returned by executeServerAction
      // Note: We don't re-throw here as the rejection handles the promise chain
    }
    // Return the result (though the promise is already resolved/rejected)
    return result;
  };

  // This function is called by the modal's CANCEL button
  const cancelAction = () => {
    if (pendingActionInfo) {
      // Optionally reject the promise if cancellation should be treated as an error/failure downstream
      // pendingActionInfo.reject(new Error("Action cancelled by user"));
      console.log("Action cancelled by user.");
    }
    setIsConfirmationModalOpen(false);
    setPendingActionInfo(null);
  };

  const showResult = (result: ActionResultConfig) => {
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  // This is the main function components interact with
  const executeServerAction = async (
    action: () => Promise<any>,
    toastConfig: ToastConfig = true,
    confirmConfig?: {
      title: string;
      message: string;
      confirmButtonText?: string;
    },
  ): Promise<any> => {
    // Returns a promise that resolves with the FINAL action result
    console.log("Executing server action request...");
    console.log("Toast Config:", toastConfig);
    console.log("Confirm Config:", confirmConfig);

    // --- Confirmation Flow ---
    if (confirmConfig) {
      console.log(
        "Confirmation required, setting up modal and returning promise...",
      );
      // Return a new Promise that will be resolved/rejected by executeAction/cancelAction
      return new Promise((resolve, reject) => {
        showConfirmationInternal(
          // Use the internal function
          {
            title: confirmConfig.title,
            message: confirmConfig.message,
            confirmButtonText: confirmConfig.confirmButtonText || "Confirm",
          },
          action, // Pass the original action
          toastConfig,
          resolve, // Pass the resolve function for the new Promise
          reject, // Pass the reject function for the new Promise
        );
      });
    }

    // --- Direct Execution Flow ---
    console.log("No confirmation needed, executing directly...");
    let result: any = null;
    let error: any = null;
    try {
      result = await action();

      // Toast logic for direct execution
      if (toastConfig) {
        const successMsg =
          typeof toastConfig === "object" && toastConfig.success
            ? toastConfig.success
            : result?.message || "Action completed successfully";

        if (
          result?.success === true ||
          (result?.success === undefined && !result?.error)
        ) {
          console.log("Direct action successful, showing success toast.");
          toast.success(successMsg);
        } else {
          const errorMsg =
            typeof toastConfig === "object" && toastConfig.error
              ? toastConfig.error
              : result?.message || result?.data?.message || "Action failed";
          console.log("Direct action failed, showing error toast.");
          toast.error(errorMsg);
        }
      }
      return result; // Resolve directly with the result
    } catch (err: any) {
      error = err;
      console.error("Error during direct action execution:", err);
      // Toast logic for caught errors during direct execution
      if (toastConfig) {
        const errorMsg =
          typeof toastConfig === "object" && toastConfig.error
            ? toastConfig.error
            : err?.message || "An unexpected error occurred";
        console.log("Direct action caught error, showing error toast.");
        toast.error(errorMsg);
      }
      throw error; // Reject directly with the error
    }
  };

  const value: GlobalAppContextType = {
    isConfirmationModalOpen,
    confirmationConfig,
    // Internal state not exposed
    executeAction, // Needs to be called by the Modal's confirm button
    cancelAction, // Needs to be called by the Modal's cancel button
    showResult,
    executeServerAction, // Primary function used by components
  };

  return (
    <GlobalAppContext.Provider value={value}>
      {children}
    </GlobalAppContext.Provider>
  );
};

// Hook remains the same
export const useGlobalApp = (): GlobalAppContextType => {
  const context = useContext(GlobalAppContext);
  if (!context) {
    throw new Error("useGlobalApp must be used within a GlobalAppProvider");
  }
  return context;
};
