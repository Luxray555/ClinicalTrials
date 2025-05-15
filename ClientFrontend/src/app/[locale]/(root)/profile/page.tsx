import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, User, Hospital, Briefcase, ShieldX } from "lucide-react";
import { getCurrentUser } from "@/actions/auth/get-current-user";
import getCurrentDoctor from "@/actions/doctors/get-current-doctor";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if ("error" in user) {
    return (
      <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-4 text-center font-semibold text-primary">
        <ShieldX size={40} />
        <p>{user.error}</p>
      </div>
    );
  }

  if (user.role === "DOCTOR") {
    const doctor = await getCurrentDoctor();

    if ("error" in doctor) {
      return (
        <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-4 text-center font-semibold text-primary">
          <ShieldX size={40} />
          <p>{doctor.error}</p>
        </div>
      );
    }

    return (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center bg-background">
        <Card className="rounded-radius w-full max-w-2xl border border-border bg-card shadow-xl">
          <CardHeader className="flex flex-col items-center text-foreground">
            <Avatar className="h-24 w-24 border-4 border-border shadow-lg">
              <AvatarImage
                src={doctor.doctor.image || ""}
                alt="Profile Picture"
              />
              <AvatarFallback className="bg-muted text-2xl font-semibold text-foreground">
                {doctor.doctor.firstName.charAt(0)}
                {doctor.doctor.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4 text-2xl font-bold">
              {doctor.doctor.firstName} {doctor.doctor.lastName}
            </CardTitle>
            <p className="text-md text-muted-foreground">
              {doctor.account.role.charAt(0).toUpperCase() +
                doctor.account.role.slice(1)}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 px-8 text-base text-foreground">
            <div className="flex items-center space-x-4 rounded-xl bg-muted p-4 shadow-sm">
              <Mail className="h-6 w-6 text-muted-foreground" />
              <p>{doctor.account.email}</p>
            </div>
            <div className="flex items-center space-x-4 rounded-xl bg-muted p-4 shadow-sm">
              <User className="h-6 w-6 text-muted-foreground" />
              <p>{doctor.doctor.gender === "MALE" ? "Male" : "Female"}</p>
            </div>
            <div className="flex items-center space-x-4 rounded-xl bg-muted p-4 shadow-sm">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
              <p>{doctor.doctor.speciality || "Not specified"}</p>
            </div>
            <div className="flex items-center space-x-4 rounded-xl bg-muted p-4 shadow-sm">
              <Hospital className="h-6 w-6 text-muted-foreground" />
              <p>{doctor.doctor.hospital || "Not specified"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
