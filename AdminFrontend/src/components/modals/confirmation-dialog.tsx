"use client";
// app/components/ConfirmationDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGlobalApp } from "@@/providers/app-global-context-provider";

export function ConfirmationDialog() {
  const {
    isConfirmationModalOpen,
    confirmationConfig,
    executeAction,
    cancelAction,
  } = useGlobalApp();

  return (
    <Dialog
      open={isConfirmationModalOpen}
      onOpenChange={(open) => !open && cancelAction()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmationConfig.title}</DialogTitle>
          <DialogDescription>{confirmationConfig.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={cancelAction}>
            {confirmationConfig.cancelButtonText}
          </Button>
          <Button onClick={executeAction}>
            {confirmationConfig.confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
