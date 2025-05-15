import getAllClinicalTrials from "@/actions/clinical-trials/get-all-clinical-trials";
import ClinicalTrialCard from "./clinical-trial-card";
import { FileWarning, ShieldX } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ClinicalTrialsList(props: {
  searchParams: SearchParams;
}) {
  const apiResponse = await getAllClinicalTrials(props.searchParams);

  if ("error" in apiResponse) {
    return (
      <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-4 text-center font-semibold text-primary">
        <ShieldX size={40} />
        <p>{apiResponse.error}</p>
      </div>
    );
  }

  const { clinicalTrials, pagination } = apiResponse;

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  function handlePageChange(newPage: number) {
    const newSearchParams = new URLSearchParams();

    Object.entries(props.searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => newSearchParams.append(key, val));
      } else if (value) {
        newSearchParams.set(key, value);
      }
    });

    newSearchParams.set("page", newPage.toString());

    return `?${newSearchParams.toString()}`;
  }

  function generatePaginationLinks() {
    const links = [];
    const maxVisiblePages = 5;
    const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfMaxVisiblePages);
    let endPage = Math.min(totalPages, currentPage + halfMaxVisiblePages);

    if (currentPage <= halfMaxVisiblePages) {
      endPage = Math.min(maxVisiblePages, totalPages);
    } else if (currentPage >= totalPages - halfMaxVisiblePages) {
      startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
    }

    if (currentPage > 1) {
      links.push(
        <PaginationItem key="previous">
          <PaginationPrevious
            href={handlePageChange(currentPage - 1)}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>,
      );
    }

    for (let page = startPage; page <= endPage; page++) {
      links.push(
        <PaginationItem key={page}>
          <PaginationLink
            href={handlePageChange(page)}
            isActive={page === currentPage}
          >
            {page}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (currentPage < totalPages) {
      links.push(
        <PaginationItem key="next">
          <PaginationNext
            href={handlePageChange(currentPage + 1)}
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>,
      );
    }

    return links;
  }

  return (
    <>
      {clinicalTrials?.length ? (
        clinicalTrials.map((clinicalTrial) => (
          <ClinicalTrialCard
            key={clinicalTrial.id}
            trialId={clinicalTrial.id}
          />
        ))
      ) : (
        <div className="m-auto flex flex-col items-center gap-4 text-center font-semibold text-primary">
          <FileWarning size={40} />
          <p>No clinical trials found</p>
        </div>
      )}
      {pagination && (
        <Pagination>
          <PaginationContent>{generatePaginationLinks()}</PaginationContent>
        </Pagination>
      )}
    </>
  );
}
