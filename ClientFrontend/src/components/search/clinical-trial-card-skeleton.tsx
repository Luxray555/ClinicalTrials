import { Skeleton } from "../ui/skeleton";

export default function ClinicalTrialCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-4 w-1/12" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
