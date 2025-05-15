import getAllPatients from "@/actions/doctors/get-all-patients";
import { columns } from "@/components/patients/columns";
import { DataTable } from "@/components/patients/data-table";
import { ShieldX } from "lucide-react";

export const revalidate = 0;

export default async function PatientsPage() {
  const patients = await getAllPatients();

  if ("error" in patients) {
    return (
      <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-4 text-center font-semibold text-primary">
        <ShieldX size={40} />
        <p>{patients.error}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 overflow-y-auto px-14 py-6">
      <DataTable columns={columns} data={patients} />
    </div>
  );
}
