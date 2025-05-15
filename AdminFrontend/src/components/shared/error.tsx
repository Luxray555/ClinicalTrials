// components/ErrorMessage.tsx
"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export default function ErrorMessage({
  message,
  className,
}: ErrorMessageProps) {
  const displayMessage = message ?? "Something went wrong. Please try again.";

  return (
    <Card
      className={cn("flex items-center gap-3 p-4 text-destructive", className)}
    >
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">{displayMessage}</p>
    </Card>
  );
}
