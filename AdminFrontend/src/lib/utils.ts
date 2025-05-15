import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBadgeProps = (status: string) => {
  if (!status) {
    return {
      text: "Unknown",
      className: "!text-muted-foreground",
      variant: "outline",
    };
  }
  switch (status.toLowerCase()) {

    case "recruiting":
      return {
        text: "Recruiting",
        className: "!bg-green-100 !!text-green-800",
        variant: "default",
      };
    case "active":
      return {
        text: "Active",
        className: "!bg-blue-100 !text-blue-800",
        variant: "default",
      };
    case "completed":
      return {
        text: "Completed",
        className: "!bg-purple-100 !text-purple-800 !text-center",
        variant: "default",
      };
    case "suspended":
      return {
        text: "Suspended",
        className: "!bg-red-100 !text-red-800",
        variant: "default",
      };
    case "terminated":
      return {
        text: "Terminated",
        className: "!bg-red-100 !text-red-800",
        variant: "default",
      };
    case "not_yet_recruiting":
      return {
        text: "Not Yet Recruiting",
        className: "!bg-blue-100 !text-blue-800",
        variant: "default",
      };

    default:
      return {
        text: status.toUpperCase(),
        className: "!text-muted-foreground",
        variant: "outline",
      };
  }
};



export const getPipelineSatusProps = (state: string) => {

  if (!state) {
    return {
      text: "Unknown",
      className: "!text-muted-foreground",
      variant: "outline",
    };
  }
  switch (state.toLowerCase()) {
    case "running":
      return {
        text: "Running",
        className: "bg-green-100 text-green-800",
        variant: "default",
      };
    case "refreshing":
      return {
        text: "Refreshing",
        className: "!bg-blue-100 !text-blue-800",
        variant: "default",
      };

    case "refresh completed":
      return {
        text: "Refresh Completed",
        className: "!bg-blue-100 !text-blue-800",
        variant: "default",
      };
    case "refresh failed":
      return {
        text: "Refresh Failed",
        className: "!bg-red-100 !text-red-800",
        variant: "destructive",
      };

    case "completed":
      return {
        text: "Completed",
        className: "!bg-blue-100 !text-blue-800",
        variant: "default",
      };
    case "failed":
      return {
        text: "Failed",
        className: "!bg-red-100 !text-red-800",
        variant: "destructive",
      };
    case "stopped":
      return {
        text: "Stopped",
        className: "!bg-orange-100 !text-red-800",
        variant: "default",
      };
    case "idle":
    default:
      return {
        text: "Idle",
        className: "!text-muted-foreground",
        variant: "outline",
      };
  }
};