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
  AlertTriangle,
  Info,
  FileSearch,
  Database,
} from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { useTranslations } from "next-intl"; // Import useTranslations

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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

export const logContextSchema = z.object({
  id: z.number(),
  sourceName: z.string(),
  logEventType: z.string(),
  numberOfTrials: z.number().nullable(),
  startingFrom: z.number().nullable(),
  startYear: z.number().nullable(),
  endYear: z.number().nullable(),
  status: z.array(z.string()),
  country: z.string().nullable(),
  conditions: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type LogContext = z.infer<typeof logContextSchema>;

// Define possible event types (make sure these match backend values)
const eventTypes = [
  "DATA_LOADING",
  // "ERROR",
  // "INFO",
  "DATA_REFRESHING",
  // "PIPELINE_START",
  // "PIPELINE_END",
  // "PIPELINE_ERROR",
  // Add other types as needed
];

export function LogContextsTable({
  data: initialData,
  pagination: { total, page, pageSize, totalPages },
}: {
  data: LogContext[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}) {
  const t = useTranslations("LogContextsTable"); // Initialize useTranslations
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = React.useState(() => initialData);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "DATA_LOADING":
      case "PIPELINE_START":
        return <Database className="mr-2 h-4 w-4 text-blue-500" />;
      case "ERROR":
      case "PIPELINE_ERROR":
        return <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />;
      case "INFO":
      case "PIPELINE_END":
      case "DATA_REFRESHING": // Or use a different icon for refresh
        return <Info className="mr-2 h-4 w-4 text-green-500" />;
      default:
        return <FileSearch className="mr-2 h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    try {
      return format(date, t("dateTimeFormat")); // Use localized format
    } catch (error) {
      console.error("Error formatting date:", error);
      return date.toString(); // Fallback
    }
  };

  const formatParameters = (log: LogContext) => {
    const params = [];
    const paramT = t.raw("parameters"); // Get the parameters sub-object

    if (log.numberOfTrials)
      params.push(`${paramT.trials}: ${log.numberOfTrials}`);
    if (log.startingFrom) params.push(`${paramT.from}: ${log.startingFrom}`);
    if (log.startYear) {
      params.push(
        `${paramT.years}: ${log.startYear}${log.endYear ? `-${log.endYear}` : ""}`,
      );
    }
    if (log.country) params.push(`${paramT.country}: ${log.country}`);
    if (log.status?.length)
      params.push(`${paramT.statuses}: ${log.status.length}`);
    if (log.conditions?.length)
      params.push(`${paramT.conditions}: ${log.conditions.length}`);

    return params.length ? params.join(", ") : paramT.none;
  };

  const columns: ColumnDef<LogContext>[] = [
    {
      accessorKey: "id",
      header: t("columns.id"),
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "sourceName",
      header: t("columns.sourceName"),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.sourceName}</div>
      ),
    },
    {
      accessorKey: "logEventType",
      header: t("columns.logEventType"),
      cell: ({ row }) => {
        const eventType = row.original.logEventType;
        const getVariant = () => {
          switch (eventType) {
            case "DATA_LOADING":
            case "PIPELINE_START":
              return "default";
            case "ERROR":
            case "PIPELINE_ERROR":
              return "destructive";
            case "DATA_REFRESHING":
              return "outline";
            case "INFO":
            case "PIPELINE_END":
            default:
              return "secondary";
          }
        };
        // Translate the event type string itself
        const translatedEventType = t(
          `eventTypes.${eventType}` as any,
          {},
          eventType,
        );

        return (
          <Badge
            variant={getVariant()}
            className="flex w-fit items-center gap-1"
          >
            {getEventTypeIcon(eventType)}
            <span>{translatedEventType}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "parameters",
      header: t("columns.parameters"),
      cell: ({ row }) => (
        <div className="max-w-md truncate text-sm text-muted-foreground">
          {formatParameters(row.original)}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("columns.createdAt"),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {formatTimestamp(row.original.createdAt)}
        </div>
      ),
    },
  ];

  const updatePaginationInUrl = React.useCallback(
    (newPage: number, newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      params.set("pageSize", newPageSize.toString());
      // Preserve other filters like 'type'
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const updateEventTypeFilter = React.useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1"); // Reset to page 1 when filter changes
      if (value === "ALL") {
        params.delete("type");
      } else {
        params.set("type", value);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
    pageCount: totalPages,
    manualPagination: true,
    manualFiltering: true, // Indicate filtering is handled manually (via URL)
    manualSorting: true, // Assuming sorting might also be server-side later
    onSortingChange: setSorting, // Keep local state for display if needed
    onColumnFiltersChange: setColumnFilters, // Keep local state for display if needed
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const currentPagination = { pageIndex: page - 1, pageSize };
      const newPagination =
        typeof updater === "function" ? updater(currentPagination) : updater;
      updatePaginationInUrl(
        newPagination.pageIndex + 1,
        newPagination.pageSize,
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">
                  {t("customizeColumns.long")}
                </span>
                <span className="lg:hidden">{t("customizeColumns.short")}</span>
                <ChevronDownIcon className="ml-2 h-4 w-4" />
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
                  // Try to translate column id, fallback to id itself
                  const headerText = t(
                    `columns.${column.id}` as any,
                    {},
                    column.id,
                  );
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {headerText}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-6">
        <div className="flex gap-2 py-2">
          <Input
            placeholder={t("filter.sourcePlaceholder")}
            value={
              (table.getColumn("sourceName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) => {
              // Note: This applies local filtering if manualFiltering=false
              // If manualFiltering=true, you'd update URL params here instead
              table.getColumn("sourceName")?.setFilterValue(event.target.value);
            }}
            className="max-w-sm"
          />

          <Select
            value={searchParams.get("type") ?? "ALL"} // Get value from URL
            onValueChange={updateEventTypeFilter} // Update URL on change
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("filter.typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filter.allTypes")}</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`eventTypes.${type}` as any, {}, type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    {t("noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {t("pagination.showing", {
              count: table.getRowModel().rows.length,
              total,
            })}
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t("pagination.rowsPerPage")}
              </span>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  const newPageSize = Number(value);
                  updatePaginationInUrl(1, newPageSize);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder={pageSize} />
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
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              {t("pagination.pageInfo", {
                page,
                totalPages: totalPages > 0 ? totalPages : 1,
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => updatePaginationInUrl(1, pageSize)}
                disabled={page <= 1}
              >
                <span className="sr-only">{t("pagination.firstPage")}</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => updatePaginationInUrl(page - 1, pageSize)}
                disabled={page <= 1}
              >
                <span className="sr-only">{t("pagination.previousPage")}</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => updatePaginationInUrl(page + 1, pageSize)}
                disabled={page >= totalPages}
              >
                <span className="sr-only">{t("pagination.nextPage")}</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => updatePaginationInUrl(totalPages, pageSize)}
                disabled={page >= totalPages}
              >
                <span className="sr-only">{t("pagination.lastPage")}</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
