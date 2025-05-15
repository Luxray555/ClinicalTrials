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
import { DataTableColumnHeader } from "./data-table-column-header";
import { Patient } from "@/typings/patients";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import EditPatientForm from "./edit-patient-form";
import PatientDetailsCard from "./patient-details-card";
import { useState } from "react";
import removePatient from "@/actions/doctors/remove-patient";
import { useToast } from "@/hooks/use-toast";

function ActionsCell({ row }: { row: any }) {
  const patient = row.original;
  const [openMenu, setOpenMenu] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const { toast } = useToast();

  async function handleRemovePatient() {
    try {
      const response = await removePatient(patient.patient.id);
      if ("error" in response) {
        console.error("Failed to remove patient", response.error);
        toast({
          title: "Failed to remove patient",
          variant: "destructive",
          description: response.error,
        });
      }
      toast({
        title: "Patient removed successfully",
        description: `${patient.account.email} has been removed`,
      });
    } catch (error) {
      console.error("Failed to remove patient", error);
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
            onClick={() => navigator.clipboard.writeText(patient.account.email)}
          >
            Copy patient email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpenMenu(false);
              setOpenView(true);
            }}
          >
            View patient details
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpenMenu(false);
              setOpenEdit(true);
            }}
          >
            Edit patient informations
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpenMenu(false);
              handleRemovePatient();
            }}
            className="hover:text-destructive-hover text-destructive"
          >
            Remove patient
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-md:custom-scrollbar max-w-2xl rounded-lg p-6 shadow-lg max-md:max-w-lg max-md:overflow-y-scroll max-sm:max-w-sm"
        >
          <PatientDetailsCard patient={patient} />
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-md:custom-scrollbar max-w-2xl rounded-lg p-6 shadow-lg max-md:h-screen max-md:max-w-lg max-md:overflow-y-scroll max-sm:max-w-sm"
        >
          <DialogTitle>Update patient informations</DialogTitle>
          <EditPatientForm setOpenEdit={setOpenEdit} patient={patient} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const columns: ColumnDef<Patient>[] = [
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
    accessorKey: "email",
    accessorFn: (patient) => patient.account.email,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <p>{row.original.account.email}</p>,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First name" />
    ),
    cell: ({ row }) => <p>{row.original.patient.firstName}</p>,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last name" />
    ),
    cell: ({ row }) => <p>{row.original.patient.lastName}</p>,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => <p>{row.original.patient.gender}</p>,
  },
  {
    accessorKey: "healthStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Health status" />
    ),
    cell: ({ row }) => (
      <Badge
        className={cn("capitalize", {
          "bg-green-600 hover:bg-green-700":
            row.original.patient.healthStatus.toUpperCase() === "STABLE",
          "bg-red-600 hover:bg-red-700":
            row.original.patient.healthStatus.toUpperCase() === "CRITICAL",
          "bg-yellow-600 hover:bg-yellow-700":
            row.original.patient.healthStatus.toUpperCase() === "IMPROVING",
          "bg-orange-600 hover:bg-orange-700":
            row.original.patient.healthStatus.toUpperCase() === "DETERIORATING",
          "bg-blue-600 hover:bg-blue-700":
            row.original.patient.healthStatus.toUpperCase() === "RECOVERED",
          "bg-purple-600 hover:bg-purple-700":
            row.original.patient.healthStatus.toUpperCase() ===
            "UNDER_TREATMENT",
          "bg-gray-600 hover:bg-gray-700":
            row.original.patient.healthStatus.toUpperCase() === "UNKNOWN",
        })}
      >
        {row.original.patient.healthStatus.toLowerCase()}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
