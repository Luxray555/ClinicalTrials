"use client";

import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ActionFn = () => Promise<any>;

export function useServerAction() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    confirmButtonText: "Confirm",
  });

  const [pendingAction, setPendingAction] = useState<ActionFn | null>(null);
  const [actionResolver, setActionResolver] = useState<
    ((value: any) => void) | null
  >(null);

  const executeServerAction = async (
    action: Promise<any>,
    toastConfig: boolean | { success?: string; error?: string } = true,
    confirmConfigInput?: {
      title: string;
      message: string;
      confirmButtonText?: string;
    },
  ) => {
    // If confirmation is required
    if (confirmConfigInput) {
      console.log("confirmConfigInput", confirmConfigInput);
      return new Promise((resolve) => {
        setConfirmConfig({
          title: confirmConfigInput.title,
          message: confirmConfigInput.message,
          confirmButtonText: confirmConfigInput.confirmButtonText || "Confirm",
        });

        // Defer action execution by wrapping in a function
        setPendingAction(() => () => action);
        setActionResolver(() => resolve);
        setIsConfirmOpen(true);
      });
    }

    // No confirmation needed, execute immediately
    try {
      console.log("before result but wait wthre is no fori stop");
      const result = await action;

      if (toastConfig) {
        const successMsg =
          typeof toastConfig === "object" && toastConfig.success
            ? toastConfig.success
            : result?.message || "Action completed successfully";

        if (result?.success !== false) {
          toast.success(successMsg);
        } else {
          const errorMsg =
            typeof toastConfig === "object" && toastConfig.error
              ? toastConfig.error
              : result?.message || "Action failed";
          toast.error(errorMsg);
        }
      }

      return result;
    } catch (error: any) {
      if (toastConfig) {
        const errorMsg =
          typeof toastConfig === "object" && toastConfig.error
            ? toastConfig.error
            : error?.message || "An unexpected error occurred";
        toast.error(errorMsg);
      }
      throw error;
    }
  };

  const handleConfirm = async () => {
    setIsConfirmOpen(false);

    try {
      const result = pendingAction ? await pendingAction() : null;

      if (result?.success !== false) {
        toast.success(result?.message || "Action completed successfully");
      } else {
        toast.error(result?.message || "Action failed");
      }

      if (actionResolver) {
        actionResolver(result);
      }

      return result;
    } catch (error: any) {
      toast.error(error?.message || "An unexpected error occurred");
      throw error;
    } finally {
      setPendingAction(null);
      setActionResolver(null);
    }
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
    setPendingAction(null);

    if (actionResolver) {
      actionResolver({ cancelled: true });
    }

    setActionResolver(null);
  };

  const ConfirmationDialog = () => (
    <Dialog
      open={isConfirmOpen}
      onOpenChange={(open) => !open && handleCancel()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmConfig.title}</DialogTitle>
          <p className="mt-2">{confirmConfig.message}</p>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {confirmConfig.confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    executeServerAction,
    ConfirmationDialog,
  };
}
