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
  Calendar,
  Play,
  Square,
  Eye,
  MoreVerticalIcon,
  Database,
  Globe,
  FileSpreadsheet,
} from "lucide-react";
import { z } from "zod";
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
import { ScheduleModal } from "./schedule-modal";
import { RunPipelineModal } from "./run-pipeline-modal";
import { usePipelines } from "@@/providers/websocket-provider";
import { stopPipeline } from "@/api-access/server-side-data-access/actions/data-sources/stop-pipeline";
import { cn, getPipelineSatusProps } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const dataSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["API", "Website Scraper", "INVESTIGATOR"]),
  isRunning: z.boolean().optional(),
  slug: z.string().optional(),
  nextSync: z.string().optional(),
  schedule: z.object({
    frequency: z.string().optional(),
    timeOfDay: z.string().optional(),
    dayOfWeek: z.string().optional(),
    DaysOfMonth: z.array(z.number()).optional(),
    nextSync: z.string().optional(),
  }),
});

type DataSource = z.infer<typeof dataSourceSchema>;

export function DataSourcesTable({
  data: initialData,
  pagination: { total, page, pageSize, totalPages },
}: {
  data: DataSource[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}) {
  const t = useTranslations("DataSourcesTable");
  const router = useRouter();
  const pipelines = usePipelines();
  const searchParams = useSearchParams();
  const [data, setData] = React.useState(() => initialData);
  const { executeServerAction } = useGlobalApp();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRunPipelineModalOpen, setIsRunPipelineModalOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSource | null>(null);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const handleConfigureSchedule = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setIsScheduleModalOpen(true);
  };

  const handleStartPipeline = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setIsRunPipelineModalOpen(true);
  };

  const handleStopPipeline = (dataSource: DataSource) => {
    executeServerAction(() => stopPipeline(dataSource.slug), true, {
      title: t("confirmation.stop.title"),
      message: t("confirmation.stop.message", { name: dataSource.name }),
      confirmButtonText: t("confirmation.stop.confirm"),
    });
  };

  const handleViewDetails = (dataSource: DataSource) => {
    router.push(`/data-sources/${dataSource.id}`);
  };

  const columns: ColumnDef<DataSource>[] = [
    {
      accessorKey: "name",
      header: t("columns.name"),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "type",
      header: t("columns.type"),
      cell: ({ row }) => {
        const type = row.original.type;
        const getIcon = () => {
          switch (type) {
            case "API":
              return <Database className="mr-2 h-4 w-4" />;
            case "Website Scraper":
              return <Globe className="mr-2 h-4 w-4" />;
            case "INVESTIGATOR":
              return <FileSpreadsheet className="mr-2 h-4 w-4" />;
            default:
              return null;
          }
        };

        return (
          <div className="flex items-center">
            {getIcon()}
            <span>{t(`type.${type}` as any)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "nextSync",
      header: t("columns.nextSync"),
      cell: ({ row }) => (
        <div className="flex items-center text-sm">
          <Calendar className="mr-2 h-4 w-4" />
          {row.original.schedule.nextSync || t("sync.notScheduled")}
        </div>
      ),
    },

    // {
    //   accessorKey: "status",
    //   header: t("columns.status"),
    //   cell: ({ row }) => {
    //     const state = pipelines[row.original.name] || "idle";
    //     const { text, className, variant } = getPipelineSatusProps(state);
    //     if (!state) {
    //       return {
    //         text: "Unknown",
    //         className: "!text-muted-foreground",
    //         variant: "outline",
    //       };
    //     }
    //     switch (state.toLowerCase()) {
    //       case "running":
    //         return {
    //           text: "Running",
    //           className: "bg-green-100 text-green-800",
    //           variant: "default",
    //         };
    //       case "completed":
    //         return {
    //           text: "Completed",
    //           className: "!bg-blue-100 !text-blue-800",
    //           variant: "default",
    //         };
    //       case "failed":
    //         return {
    //           text: "Failed",
    //           className: "!bg-red-100 !text-red-800",
    //           variant: "destructive",
    //         };
    //       case "stopped":
    //         return {
    //           text: "Stopped",
    //           className: "!bg-orange-100 !text-red-800",
    //           variant: "default",
    //         };
    //       case "idle":
    //       default:
    //         return {
    //           text: "Idle",
    //           className: "!text-muted-foreground",
    //           variant: "outline",
    //         };
    //     }

    //     return (
    //       <Badge variant={variant as any} className={cn(className)}>
    //         {t(`status.${text.toLowerCase()}` as any, {}, text)}
    //       </Badge>
    //     );
    //   },
    // },
    {
      accessorKey: "status",
      header: t("columns.status"),
      cell: ({ row }) => {
        const state =
          pipelines.collectionPipelines[row.original.name] || "idle"; // Get state for the pipeline or fallback to "idle"

        // Return early if no state exists
        if (!state) {
          return (
            <Badge variant="outline" className="!text-muted-foreground">
              {t("status.Unknown", { defaultValue: "Unknown" })}
            </Badge>
          );
        }

        // Use a switch statement to handle the different states
        let text: string;
        let className: string;
        let variant: string;

        switch (state.toLowerCase()) {
          case "running":
            text = "Running";
            className = "bg-green-100 text-green-800";
            variant = "default";
            break;
          case "completed":
            text = "Completed";
            className = "!bg-blue-100 !text-blue-800";
            variant = "default";
            break;
          case "failed":
            text = "Failed";
            className = "!bg-red-100 !text-red-800";
            variant = "destructive";
            break;
          case "stopped":
            text = "Stopped";
            className = "!bg-orange-100 !text-red-800";
            variant = "default";
            break;
          case "idle":
          default:
            text = "Idle";
            className = "!text-muted-foreground";
            variant = "outline";
            break;
        }

        return (
          <Badge variant={variant as "outline"} className={className}>
            {t(`status.${text.toLowerCase()}`, { defaultValue: text })}
          </Badge>
        );
      },
    },
    {
      accessorKey: "refreshStatus",
      header: t("columns.refreshStatus"),
      cell: ({ row }) => {
        const state = pipelines.refreshPipelines[row.original.name] || "idle"; // Get state for the pipeline or fallback to "idle"

        // Return early if no state exists
        if (!state) {
          return (
            <Badge variant="outline" className="!text-muted-foreground">
              {t("status.Unknown", { defaultValue: "Unknown" })}
            </Badge>
          );
        }

        // Use a switch statement to handle the different states
        let text: string;
        let className: string;
        let variant: string;

        switch (state.toLowerCase()) {
          case "refresh completed":
            text = "refresh completed";
            className = "bg-green-100 text-green-800";
            variant = "default";
            break;
          case "refreshing":
            text = "Refreshing";
            className = "!bg-blue-100 !text-blue-800";
            variant = "default";
            break;
          case "refresh failed":
            text = "refresh failed";
            className = "!bg-red-100 !text-red-800";
            variant = "destructive";
            break;
          case "idle":
          default:
            text = "Idle";
            className = "!text-muted-foreground";
            variant = "outline";
            break;
        }

        return (
          <Badge variant={variant as "outline"} className={className}>
            {t(`status.${text.toLowerCase()}`, { defaultValue: text })}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const dataSource = row.original;
        const isRunning =
          pipelines.collectionPipelines[dataSource.name] === "running";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <MoreVerticalIcon />
                <span className="sr-only">{t("actions.openMenu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => handleConfigureSchedule(dataSource)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {t("actions.configureSchedule")}
              </DropdownMenuItem>

              {!isRunning ? (
                <DropdownMenuItem
                  onClick={() => handleStartPipeline(dataSource)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t("actions.startPipeline")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleStopPipeline(dataSource)}
                >
                  <Square className="mr-2 h-4 w-4" />
                  {t("actions.stopPipeline")}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleViewDetails(dataSource)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("actions.viewDetails")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const updatePaginationInUrl = React.useCallback(
    (newPage: number, newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      params.set("pageSize", newPageSize.toString());
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize })
          : updater;

      const newPage = newPagination.pageIndex + 1;
      const newPageSize = newPagination.pageSize;
      updatePaginationInUrl(newPage, newPageSize);
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
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {t(`columns.${column.id}` as any, {}, column.id)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-6">
        <div className="flex items-center gap-2 py-2">
          <Input
            placeholder={t("filter.placeholder")}
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          <Select
            value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
            onValueChange={(value) =>
              table
                .getColumn("type")
                ?.setFilterValue(value === "ALL" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filter.typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {["API", "Website Scraper", "INVESTIGATOR"].map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`type.${type}` as any)}
                </SelectItem>
              ))}
              <SelectItem value="ALL">{t("filter.allTypes")}</SelectItem>
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
              {t("pagination.pageInfo", { page, totalPages })}
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

      {selectedDataSource && (
        <>
          <ScheduleModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            dataSource={selectedDataSource}
          />

          <RunPipelineModal
            isOpen={isRunPipelineModalOpen}
            onClose={() => setIsRunPipelineModalOpen(false)}
            dataSource={selectedDataSource}
          />
        </>
      )}
    </div>
  );
}
