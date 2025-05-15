import ClinicalTrialCardSkeleton from "@/components/search/clinical-trial-card-skeleton";
import ClinicalTrialsList from "@/components/search/clinical-trials-list";
import FilterLeftBar from "@/components/search/filter-left-bar";

import { Suspense } from "react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function SearchPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex w-full flex-1 max-md:flex-col">
      <FilterLeftBar />
      <div className="flex h-[calc(100vh-65px)] w-full flex-col gap-6 overflow-y-auto p-6">
        <Suspense
          fallback={Array.from({ length: 5 }).map((_, index) => (
            <ClinicalTrialCardSkeleton key={index} />
          ))}
          key={JSON.stringify(searchParams)}
        >
          <ClinicalTrialsList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
