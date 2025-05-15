"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  Eye,
  MoreVerticalIcon,
  Pill,
  Hospital,
  Trash,
  Check,
  Link2Off,
  // Calendar, // Uncomment if using the follow-up column
} from "lucide-react";
import { z } from "zod";
import { useTranslations } from "next-intl"; // Import useTranslations

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useGlobalApp } from "@@/providers/app-global-context-provider";
import { useState } from "react";

import { cn, getBadgeProps } from "@/lib/utils";
import { ClinicalTrialStatusEnum } from "@/typings"; // Assuming this Enum exists
import { deleteClinicalTrial } from "@/api-access/server-side-data-access/actions/clinical-trials/delete-trial";

// Define the schema for clinical trials (Ensure it matches your actual data structure)
export const clinicalTrialSchema = z.object({
  id: z.string(),
  title: z.string(),
  phase: z.enum(["Phase 1", "Phase 2", "Phase 3", "Phase 4"]), // Assuming phases are like this
  // Match status enum keys used in getBadgeProps and potentially filters
  status: z.nativeEnum(ClinicalTrialStatusEnum),
  slug: z.string().optional(),
  startDate: z.string().optional(), // Consider z.date() if parsing
  endDate: z.string().optional(), // Consider z.date() if parsing
  enrollmentTarget: z.number().optional(),
  // Adjust property names based on your actual data from API
  currentEnrollmentCount: z.number().optional(), // Example: renamed from currentEnrollment
  primaryInvestigator: z.string().optional(),
  conditions: z.array(z.object({ name: z.string() })).optional(), // Assuming conditions have a name property
  sponsor: z.string().optional(),
  locations: z.array(z.string()).optional(),
  // Schedule might be different, adjust as needed
  // schedule: z.object({
  //   nextFollowUp: z.string().optional(),
  //   frequency: z.string().optional(),
  // }),
});

type ClinicalTrial = z.infer<typeof clinicalTrialSchema>;

// --- Component Definition ---
export default function ClinicalTrialsTable({
  type,
  data: initialData,
  pagination: { totalItems, currentPage, itemsPerPage, totalPages },
}: {
  type?: string; // Used for conditional rendering (e.g., INVESTIGATOR actions)
  data: ClinicalTrial[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}) {
  const t = useTranslations("ClinicalTrialsTable"); // Initialize translations
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = React.useState(() => initialData);
  const { executeServerAction } = useGlobalApp();

  // --- Action Handlers ---
  const handleDelete = (trial: ClinicalTrial) => {
    executeServerAction(
      () => deleteClinicalTrial(trial.id),
      {
        success: t("toastMessages.deleteSuccess"), // Translated toast
        error: t("toastMessages.deleteError"), // Translated toast
      },
      {
        title: t("actionsConfirmation.delete.title"), // Translated title
        message: t("actionsConfirmation.delete.message"), // Translated message (no interpolation needed here)
        confirmButtonText: t("actionsConfirmation.delete.confirmButton"), // Translated button text
      },
    );
  };

  // --- Modal State (if modals were used) ---
  // const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  // const [isRunTrialModalOpen, setIsRunTrialModalOpen] = useState(false);
  // const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);

  // Sync data prop changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // --- Table State ---
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // --- Navigation/Action Functions ---
  // const handleConfigureSchedule = (trial: ClinicalTrial) => { ... };
  // const handleStartTrial = (trial: ClinicalTrial) => { ... };
  // const handleStopTrial = (trial: ClinicalTrial) => { ... };

  const handleViewDetails = (trial: ClinicalTrial) => {
    // Consider locale-aware routing if necessary
    router.push(`/clinical-trials/${trial.id}`);
  };

  // --- Column Definitions ---
  const columns: ColumnDef<ClinicalTrial>[] = React.useMemo(
    () => [
      {
        accessorKey: "title",
        header: t("table.header.title"), // Translated
        cell: ({ row }) => (
          <div className="font-medium">{row.original.title}</div>
        ),
      },
      {
        accessorKey: "phase",
        header: t("table.header.phase"), // Translated
        cell: ({ row }) => {
          const phase = row.original.phase;
          return (
            <div className="flex items-center">
              <Pill className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
              {/* Added color */}
              <span>{phase || "NA"}</span>{" "}
              {/* Phase values usually aren't translated unless required */}
            </div>
          );
        },
      },
      {
        accessorKey: "conditions",
        header: t("table.header.conditions"), // Translated
        cell: ({ row }) => (
          <div className="flex items-center text-sm">
            <Hospital className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />{" "}
            {/* Adjusted styling */}
            {/* Ensure 'conditions' array and 'name' exist before mapping */}
            <span className="">
              {" "}
              {/* Added truncate for long lists */}
              {row.original.conditions && row.original.conditions.length > 0
                ? row.original.conditions
                    .map((condition) => condition?.name)
                    .filter(Boolean) // Filter out potential null/undefined names
                    .join(" / ")
                : t("table.body.conditionsUnknown")}{" "}
              {/* Translated fallback */}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "enrollment", // Use a distinct key if sorting/filtering needed
        header: t("table.header.enrollment"), // Translated
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.currentEnrollmentCount ?? 0} /{" "}
            {/* Use nullish coalescing */}
            {row.original.enrollmentTarget ??
              t("table.body.enrollmentInfinite")}{" "}
            {/* Translated fallback */}
          </div>
        ),
      },
      // { // Example: Follow-up column
      //   accessorKey: "nextFollowUp", // Needs data in schema
      //   header: t("table.header.nextFollowUp"), // Translated
      //   cell: ({ row }) => (
      //     <div className="flex items-center text-sm">
      //       <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
      //       {row.original.schedule?.nextFollowUp || t("table.body.notScheduled")} {/* Translated fallback */}
      //     </div>
      //   ),
      // },
      {
        accessorKey: "status",
        header: t("table.header.status"), // Translated
        cell: ({ row }) => {
          const status = row.original.status;
          // Assuming getBadgeProps returns variant/className and uses the status key
          const { className, variant } = getBadgeProps(status);
          // Translate the status text for display
          const statusText = t(`statusEnum.${status}`, {
            defaultValue: status,
          });

          return (
            <Badge variant={variant} className={cn(className, "capitalize")}>
              {" "}
              {/* Ensure capitalization */}
              {statusText}
            </Badge>
          );
        },
        // Add filter function if needed
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const trial = row.original;
          // const isActive = trial.status === ClinicalTrialStatusEnum.Active; // Example check

          return (
            <div className="text-right">
              {" "}
              {/* Align content right */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex size-8 p-0 text-muted-foreground data-[state=open]:bg-muted"
                  >
                    <span className="sr-only">
                      {t("table.body.actions.openMenu")}
                    </span>{" "}
                    {/* Translated */}
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleViewDetails(trial)}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>{t("table.body.actions.viewDetails")}</span>{" "}
                    {/* Translated */}
                  </DropdownMenuItem>

                  {/* Conditional Actions for INVESTIGATOR type */}
                  {type === "INVESTIGATOR" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-700" // Simplified focus
                        // Assuming refuse action would call a different server action
                        // onClick={() => handleRefuse(trial)}
                      >
                        <Link2Off className="mr-2 h-4 w-4" />
                        <span>{t("table.body.actions.refuse")}</span>{" "}
                        {/* Translated */}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-green-500 focus:text-green-700" // Simplified focus
                        // Assuming accept action would call a different server action
                        // onClick={() => handleAccept(trial)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        <span>{t("table.body.actions.accept")}</span>{" "}
                        {/* Translated */}
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Always show Delete Action */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-700" // Simplified focus
                    onClick={() => handleDelete(trial)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>{t("table.body.actions.delete")}</span>{" "}
                    {/* Translated */}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t, type, router, handleDelete],
  ); // Add dependencies

  // --- URL Update Logic ---
  const updatePaginationInUrl = React.useCallback(
    (newPage: number, newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      params.set("pageSize", newPageSize.toString());
      // Preserve other filters like status or title when changing pages
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // --- Table Instance ---
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: itemsPerPage,
      },
    },
    pageCount: totalPages,
    manualPagination: true,
    manualFiltering: true, // Enable if filtering affects URL/API call
    manualSorting: true, // Enable if sorting affects URL/API call
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex: currentPage - 1, pageSize: itemsPerPage })
          : updater;

      const newPage = newPagination.pageIndex + 1;
      const newPageSize = newPagination.pageSize;
      updatePaginationInUrl(newPage, newPageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Needed for client-side filter access
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // --- Render ---
  return (
    <div className="flex w-full flex-col justify-start gap-4 md:gap-6">
      {" "}
      {/* Adjusted gap */}
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-2 px-4 md:flex-row md:items-center lg:px-6">
        <h2 className="text-xl font-semibold">{t("headerTitle")}</h2>{" "}
        {/* Translated */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <ColumnsIcon className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">
                  {t("customizeColumns.button")}
                </span>{" "}
                {/* Translated */}
                <span className="lg:hidden">
                  {t("customizeColumns.buttonShort")}
                </span>{" "}
                {/* Translated */}
                <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => {
                  // Attempt to translate column header, fallback to ID
                  const columnHeader = t(`table.header.${column.id}`, {
                    defaultValue: column.id,
                  });
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnHeader}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-col gap-2 px-4 md:flex-row md:items-center md:gap-4 lg:px-6">
        <Input
          placeholder={t("filters.trialPlaceholder")} // Translated
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            table.getColumn("title")?.setFilterValue(value);
            // Optional: Update URL params for title filtering (debounced recommended)
            // const params = new URLSearchParams(searchParams.toString());
            // if (value) params.set("title", value); else params.delete("title");
            // params.set("page", "1"); // Reset page on filter change
            // router.push(`?${params.toString()}`, { scroll: false });
          }}
          className="h-9 max-w-full md:max-w-xs"
        />

        <Select
          value={searchParams.get("status") ?? "ALL"} // Read status from URL, default to "ALL"
          onValueChange={(value) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === "ALL") {
              params.delete("status");
            } else {
              params.set("status", value);
            }
            params.set("page", "1"); // Reset page
            router.push(`?${params.toString()}`, { scroll: false });
            // Update local table state if needed (though URL drives it)
            // table.getColumn("status")?.setFilterValue(value === "ALL" ? undefined : value);
          }}
        >
          <SelectTrigger className="h-9 w-full md:w-auto md:min-w-[180px]">
            <SelectValue placeholder={t("filters.statusPlaceholder")} />{" "}
            {/* Translated */}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("filters.allStatusesOption")}
            </SelectItem>{" "}
            {/* Translated */}
            {/* Iterate over Enum keys */}
            {Object.values(ClinicalTrialStatusEnum).map((statusValue) => (
              <SelectItem key={statusValue} value={statusValue}>
                {/* Translate the display text */}
                {t(`statusEnum.${statusValue}`, { defaultValue: statusValue })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Table Area */}
      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="py-3" // Adjust padding if needed
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn({ "bg-muted/5": index % 2 !== 0 })} // Subtle striping
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {" "}
                        {/* Match header padding */}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("table.body.noResults")} {/* Translated */}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row lg:px-6">
        <div className="flex-1 text-sm text-muted-foreground">
          {/* Translated showing text */}
          {t("pagination.showing", {
            count: table.getRowModel().rows.length,
            total: totalItems,
          })}
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {t("pagination.rowsPerPage")}
            </span>{" "}
            {/* Translated */}
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                updatePaginationInUrl(1, Number(value)); // Reset to page 1 on size change
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {/* Translated page info */}
            {t("pagination.pageInfo", {
              page: currentPage,
              totalPages: totalPages,
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => updatePaginationInUrl(1, itemsPerPage)}
              disabled={currentPage <= 1}
              aria-label={t("pagination.firstPage")} // Translated
            >
              <ChevronsLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={() =>
                updatePaginationInUrl(currentPage - 1, itemsPerPage)
              }
              disabled={currentPage <= 1}
              aria-label={t("pagination.previousPage")} // Translated
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={() =>
                updatePaginationInUrl(currentPage + 1, itemsPerPage)
              }
              disabled={currentPage >= totalPages}
              aria-label={t("pagination.nextPage")} // Translated
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => updatePaginationInUrl(totalPages, itemsPerPage)}
              disabled={currentPage >= totalPages}
              aria-label={t("pagination.lastPage")} // Translated
            >
              <ChevronsRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* --- Modals --- */}
      {/* Keep modal rendering logic if needed */}
      {/* {selectedTrial && (...)} */}
    </div>
  );
}
