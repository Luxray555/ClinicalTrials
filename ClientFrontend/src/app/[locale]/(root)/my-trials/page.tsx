import getAllClinicalTrials from "@/actions/investigator/get-all-clinical-trials";
import { columns } from "@/components/my-trials/columns";
import { DataTable } from "@/components/my-trials/data-table";
import { ShieldX } from "lucide-react";

export const revalidate = 0;

export default async function MyTrialsPage() {
  const myTrials = await getAllClinicalTrials();

  if ("error" in myTrials) {
    return (
      <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-4 text-center font-semibold text-primary">
        <ShieldX size={40} />
        <p>{myTrials.error}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 overflow-y-auto px-14 py-6">
      <DataTable columns={columns} data={myTrials} />
    </div>
  );
}
