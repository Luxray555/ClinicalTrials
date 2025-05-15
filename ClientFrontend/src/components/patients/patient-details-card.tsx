import { Calendar, Mail, Phone, ShieldAlert, User } from "lucide-react";
import { Badge } from "../ui/badge";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Patient } from "@/typings/patients";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  patient: Patient;
};

export default function PatientDetailsCard({ patient }: Props) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
          <User className="h-6 w-6 text-primary" />
          {patient.patient.firstName} {patient.patient.lastName}
        </DialogTitle>
        <DialogDescription className="text-sm">
          Patient details and medical history
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="rounded-lg border p-4 max-md:flex max-md:flex-col">
          <h3 className="mb-2 text-base font-semibold">Personal Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm max-md:grid-cols-1">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-semibold">Email:</span>
              {patient.account.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-semibold">Phone:</span>
              {patient.patient.phoneNumber}
            </p>
            <p className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold">Gender:</span>
              {patient.patient.gender}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-semibold">Date of Birth:</span>
              {format(patient.patient.dateOfBirth, "dd-MM-yyyy").toString()}
            </p>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-base font-semibold">Medical Information</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <strong>Health Status:</strong>
              <Badge
                className={cn("px-2 py-1 capitalize text-white", {
                  "bg-green-600 hover:bg-green-700":
                    patient.patient.healthStatus.toUpperCase() === "STABLE",
                  "bg-red-600 hover:bg-red-700":
                    patient.patient.healthStatus.toUpperCase() === "CRITICAL",
                  "bg-yellow-600 hover:bg-yellow-700":
                    patient.patient.healthStatus.toUpperCase() === "IMPROVING",
                  "bg-orange-600 hover:bg-orange-700":
                    patient.patient.healthStatus.toUpperCase() ===
                    "DETERIORATING",
                  "bg-blue-600 hover:bg-blue-700":
                    patient.patient.healthStatus.toUpperCase() === "RECOVERED",
                  "bg-purple-600 hover:bg-purple-700":
                    patient.patient.healthStatus.toUpperCase() ===
                    "UNDER_TREATMENT",
                  "bg-gray-600 hover:bg-gray-700":
                    patient.patient.healthStatus.toUpperCase() === "UNKNOWN",
                })}
              >
                {patient.patient.healthStatus.toLowerCase()}
              </Badge>
            </div>
            <p className="max-w-lg whitespace-normal break-words max-md:max-w-xs">
              <strong>Medical History: </strong>
              {patient.patient.medicalHistory}
            </p>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-base font-semibold">Account Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p>
              <strong>Role:</strong> {patient.account.role}
            </p>
            <p className="flex items-center gap-2">
              <ShieldAlert
                className={`h-4 w-4 ${patient.account.isBlocked ? "text-red-500" : "text-green-500"}`}
              />
              <strong>Blocked:</strong>
              {patient.account.isBlocked ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
