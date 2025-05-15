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
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  MoreVerticalIcon,
  XIcon,
} from "lucide-react";
import { z } from "zod";
import { useTranslations } from "next-intl"; // Correct hook

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Checkbox might still be needed elsewhere, keep import if necessary
// import { Checkbox } from "@/components/ui/checkbox";
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
import { blockUser } from "@/api-access/server-side-data-access/actions/users/block-user";
import { unblockUser } from "@/api-access/server-side-data-access/actions/users/unblock-user";
import { useGlobalApp } from "@@/providers/app-global-context-provider";
import { Input } from "@/components/ui/input";
import { deleteUser } from "@/api-access/server-side-data-access/actions/users/delete-user";

// Schema remains the same
export const schema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  isBlocked: z.boolean(), // Consider boolean type if applicable
});

// Define the component Props type explicitly
interface UsersDataTableProps {
  data: z.infer<typeof schema>[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function UsersDataTable({
  // Renamed export for clarity
  data: initialData,
  pagination: { total, page, pageSize, totalPages },
}: UsersDataTableProps) {
  const t = useTranslations("UsersDataTable"); // Use the correct namespace
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = React.useState(() => initialData); // Data state remains for potential local updates

  // Effect to update local data if initialData prop changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { executeServerAction } = useGlobalApp();

  // --- Action Handlers (defined before columns) ---
  const handleBlock = (user: z.infer<typeof schema>) => {
    executeServerAction(
      () => blockUser(user.id),
      {
        success: t("actionsConfirmation.block.success"),
        error: t("actionsConfirmation.block.error"),
      },
      {
        title: t("actionsConfirmation.block.title"),
        message: t("actionsConfirmation.block.message", { email: user.email }),
        confirmButtonText: t("actionsConfirmation.block.confirmButton"),
      },
    );
  };

  const handleDelete = (user: z.infer<typeof schema>) => {
    executeServerAction(
      () => deleteUser(user.id),
      {
        success: t("actionsConfirmation.delete.success"),
        error: t("actionsConfirmation.delete.error"),
      },
      {
        title: t("actionsConfirmation.delete.title"),
        message: t("actionsConfirmation.delete.message", { email: user.email }),
        confirmButtonText: t("actionsConfirmation.delete.confirmButton"),
      },
    );
  };

  const handleUnblock = (user: z.infer<typeof schema>) => {
    executeServerAction(() => unblockUser(user.id), {
      success: t("actionsConfirmation.unblockSuccess"),
    });
  };

  // --- Column Definitions (No useMemo) ---
  const columns: ColumnDef<z.infer<typeof schema>>[] = [
    // Removed the 'select' column
    {
      accessorKey: "email",
      header: t("table.header.email"),
      cell: ({ row }) => <div>{row.original.email}</div>,
      enableHiding: false, // Keep email always visible?
    },
    {
      accessorKey: "firstName",
      header: t("table.header.firstName"),
      cell: ({ row }) => <div>{row.original.firstName}</div>,
    },
    {
      accessorKey: "lastName",
      header: t("table.header.lastName"),
      cell: ({ row }) => <div>{row.original.lastName}</div>,
    },
    {
      accessorKey: "role",
      header: t("table.header.role"),
      cell: ({ row }) => <div>{row.original.role}</div>,
      // Consider adding filterFn: 'equalsString' or a custom one if filtering needs adjustment
    },
    {
      accessorKey: "status",
      header: t("table.header.status"),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="flex w-fit items-center gap-1 px-3 py-1 text-muted-foreground" // Added items-center
        >
          {row.original.isBlocked !== true ? (
            <CheckCircle2Icon className="size-4 text-green-500 dark:text-green-400" /> // Adjusted icon size
          ) : (
            <XIcon className="size-4 text-red-500" /> // Adjusted icon size
          )}
          {row.original.isBlocked === true
            ? t("table.body.status.blocked")
            : t("table.body.status.active")}
        </Badge>
      ),
      // Consider adding filterFn for status if needed
    },
    {
      id: "actions",
      cell: ({ row }) => (
        // IMPORTANT: Define handlers (handleBlock, etc.) *before* this columns array
        // if they are defined within the component scope, otherwise, they won't be accessible here.
        // Since they ARE defined above, this is fine.
        <div className="text-right">
          {" "}
          {/* Align actions potentially */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 p-0 text-muted-foreground data-[state=open]:bg-muted" // Adjusted size/padding
              >
                <span className="sr-only">
                  {t("table.body.actions.openMenu")}
                </span>
                <MoreVerticalIcon className="size-4" />{" "}
                {/* Adjusted icon size */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {row.original.isBlocked !== true ? (
                <DropdownMenuItem onClick={() => handleBlock(row.original)}>
                  {t("table.body.actions.block")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleUnblock(row.original)}>
                  {t("table.body.actions.unblock")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-900/50 dark:focus:text-red-400" // Enhanced focus style
                onClick={() => handleDelete(row.original)}
              >
                {t("table.body.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false, // Keep actions always visible
    },
  ];
  const updateUrl = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Always reset to page 1 when filters/page size change
      if (updates.page === undefined) {
        params.set("page", "1");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // --- React Table Instance ---
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination: {
        pageIndex: page - 1, // TanStack Table uses 0-based index
        pageSize: pageSize,
      },
    },
    pageCount: totalPages,
    manualPagination: true, // Crucial for server-side pagination
    manualFiltering: true, // Crucial for server-side filtering
    manualSorting: true, // Crucial for server-side sorting (if needed)
    getRowId: (row) => row.id.toString(), // Use user ID as row ID
    onColumnFiltersChange: setColumnFilters, // Local state update for controlled inputs
    onSortingChange: setSorting, // Local state update for controlled sorting
    onColumnVisibilityChange: setColumnVisibility,
    // Use updateUrl for changes that affect server data fetching
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize })
          : updater;
      updateUrl({
        page: (newPagination.pageIndex + 1).toString(),
        pageSize: newPagination.pageSize.toString(),
      });
    },
    // Core models
    getCoreRowModel: getCoreRowModel(),
    // Models needed for filtering, pagination, sorting, faceting (if using client-side parts)
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // Needed for unique values
    getFacetedUniqueValues: getFacetedUniqueValues(), // Needed for unique values
  });

  // --- Role Filter Logic ---
  const uniqueRoles = React.useMemo(() => {
    // Statically defined roles as per previous examples
    return ["PATIENT", "DOCTOR", "ADMIN", "INVESTIGATOR"];
  }, []);

  const handleRoleFilterChange = (value: string) => {
    updateUrl({ role: value === "ALL" ? null : value });
    // Update local filter state for Tanstack Table (optional but good practice for controlled state)
    table
      .getColumn("role")
      ?.setFilterValue(value === "ALL" ? undefined : value);
  };

  const handleEmailFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    // Optional: Debounce this call in a real app
    updateUrl({ email: value || null }); // Set email param, remove if empty
    table.getColumn("email")?.setFilterValue(value); // Update local state
  };

  // --- Render ---
  return (
    <div className="flex w-full flex-col justify-start gap-4 md:gap-6">
      {" "}
      {/* Adjusted gap */}
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-2 px-4 md:flex-row md:items-center lg:px-6">
        <h2 className="text-xl font-semibold">{t("headerTitle")}</h2>
        <div className="flex items-center gap-2">
          {/* Customize Columns Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <ColumnsIcon className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">
                  {t("customizeColumns.button")}
                </span>
                <span className="lg:hidden">
                  {t("customizeColumns.buttonShort")}
                </span>
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
                  // Translate known column headers, fallback to ID
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
      {/* Filters Section */}
      <div className="flex flex-col gap-2 px-4 md:flex-row md:gap-4 lg:px-6">
        <Input
          placeholder={t("filter.emailPlaceholder")}
          // Use value from URL param for consistency or local state if debouncing
          // value={searchParams.get("email") ?? ""} // Option 1: Reflect URL state directly
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""} // Option 2: Reflect table's local state
          onChange={handleEmailFilterChange}
          className="h-9 max-w-full md:max-w-xs" // Adjusted height and max-width
        />
        <Select
          value={searchParams.get("role") ?? "ALL"} // Default to "ALL" if param is missing
          onValueChange={handleRoleFilterChange}
        >
          <SelectTrigger className="h-9 w-full md:w-auto md:min-w-[180px]">
            {" "}
            {/* Adjusted height */}
            <SelectValue placeholder={t("filter.rolePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"ALL"}>{t("filter.roleAllOption")}</SelectItem>
            {uniqueRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {/* Translate role display name if needed */}
                {t(`roles.${role.toLowerCase()}`, { defaultValue: role })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Table Section */}
      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              {" "}
              {/* Subtle background */}
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      // Add sorting indicators if needed here
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
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined} // Keep for potential future use, though selection is off
                  >
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
                    {t("table.body.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Pagination Section */}
      <div className="flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row lg:px-6">
        <div className="flex-1 text-sm text-muted-foreground">
          {/* Show total rows */}
          {/* {t("pagination.totalRows", { total: total })} */}
          {/* {t("pagination.pageInfo", {
            page,
            totalPages: totalPages > 0 ? totalPages : 1,
          })} */}
          {t("pagination.showing", {
            count: table.getRowModel().rows.length,
            total,
          })}
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {t("pagination.rowsPerPage")}
            </span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                updateUrl({ pageSize: value });
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                {" "}
                {/* Adjusted height/width */}
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
          {/* Page Indicator */}
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {t("pagination.pageInfo", {
              page: table.getState().pagination.pageIndex + 1,
              totalPages: table.getPageCount(),
            })}
          </div>
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)} // Go to first page
              disabled={!table.getCanPreviousPage()}
              aria-label={t("pagination.firstPage")}
            >
              <ChevronsLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={() => table.previousPage()} // Go to previous page
              disabled={!table.getCanPreviousPage()}
              aria-label={t("pagination.previousPage")}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={() => table.nextPage()} // Go to next page
              disabled={!table.getCanNextPage()}
              aria-label={t("pagination.nextPage")}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)} // Go to last page
              disabled={!table.getCanNextPage()}
              aria-label={t("pagination.lastPage")}
            >
              <ChevronsRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
