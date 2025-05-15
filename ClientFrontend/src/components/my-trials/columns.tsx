"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DataTableColumnHeader } from "../patients/data-table-column-header";
import { ClinicalTrial } from "@/typings/clinical-trials";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import deleteClinicalTrial from "@/actions/investigator/delete-clinical-trial";
import { useRouter } from "@/i18n/routing";
import EditClinicalTrialForm from "./edit-clinical-trial-form";

function ActionsCell({ row }: { row: any }) {
  const trial: ClinicalTrial = row.original;
  const [openMenu, setOpenMenu] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleRemoveTrial() {
    try {
      const response = await deleteClinicalTrial(trial.id);
      if ("error" in response) {
        console.error("Failed to remove clinical trial", response.error);
        toast({
          title: "Failed to remove clinical trial",
          variant: "destructive",
          description: response.error,
        });
      }
      toast({
        title: "Clinical trial removed successfully",
      });
    } catch (error) {
      console.error("Failed to remove clinical trial", error);
    }
  }

  return (
    <div>
      <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(trial.title!)}
          >
            Copy trial title
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpenMenu(false);
              router.push(`/studies/${trial.id}`);
            }}
          >
            View trial details
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpenMenu(false);
              setOpenEdit(true);
            }}
          >
            Edit trial informations
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpenMenu(false);
              handleRemoveTrial();
            }}
            className="hover:text-destructive-hover text-destructive"
          >
            Remove trial
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-md:custom-scrollbar max-w-5xl max-md:h-screen max-md:max-w-lg max-md:overflow-y-scroll max-sm:max-w-sm"
        >
          <DialogTitle>Update patient informations</DialogTitle>
          <EditClinicalTrialForm setOpenEdit={setOpenEdit} trial={trial} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const columns: ColumnDef<ClinicalTrial>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    // accessorKey: "id",
    // header: ({ column }) => (
    //   <DataTableColumnHeader column={column} title="ID" />
    // ),
    // cell: ({ row }) => <p>{row.original.patient.id}</p>,
    header: "ID",
    cell: ({ row }) => <p>{row.index + 1}</p>,
  },
  {
    accessorKey: "title",
    accessorFn: (trial) => trial.title,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => <p>{row.original.title}</p>,
  },
  {
    accessorKey: "phase",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phase" />
    ),
    cell: ({ row }) => <p>{row.original.phase}</p>,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <Badge
        className={cn("capitalize", {
          "bg-green-600 hover:bg-green-700":
            row.original.type?.toUpperCase() === "INTERVENTIONAL",
          "bg-cyan-600 hover:bg-cyan-700":
            row.original.type?.toUpperCase() === "OBSERVATIONAL",
          "bg-yellow-600 hover:bg-yellow-700":
            row.original.type?.toUpperCase() === "EXPANDED_ACCESS",
        })}
      >
        {row.original.type?.toLowerCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "eligibility",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => <p>{row.original.eligibility?.gender}</p>,
  },
  {
    accessorKey: "sponsor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sponsor" />
    ),
    cell: ({ row }) => <p>{row.original.sponsor?.name}</p>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
