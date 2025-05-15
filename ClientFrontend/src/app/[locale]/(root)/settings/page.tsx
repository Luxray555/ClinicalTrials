import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Smartphone, Sun, ShieldX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import getCurrentDoctor from "@/actions/doctors/get-current-doctor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UploadImageButton from "@/components/settings/upload-image-button";
import UpdateProfileForm from "@/components/settings/update-profile-form";
import UpdatePasswordForm from "@/components/settings/update-password-form";
import { ModeToggle } from "@/components/shared/mode-toggle";

export const revalidate = 0;

export default async function SettingsPage() {
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
    <div className="flex items-center justify-center">
      <div className="h-full w-full bg-card p-8">
        <div className="flex h-full items-center justify-between gap-8">
          <div className="sticky top-20 flex w-3/12 flex-col items-center space-y-4 self-start">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border border-border">
              <Avatar className="h-full w-full object-cover">
                <AvatarImage src={doctor.doctor.image || ""} />
                <AvatarFallback className="text-2xl font-semibold">
                  {doctor.doctor.firstName.charAt(0)}{" "}
                  {doctor.doctor.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <UploadImageButton />
          </div>

          <div className="flex w-9/12 flex-col space-y-6 self-start">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateProfileForm doctor={doctor} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdatePasswordForm />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control your notification settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <div className="mt-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <Label>Email Notifications</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <Label>Push Notifications</Label>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="text-lg font-semibold">Appearance</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-5 w-5 text-muted-foreground" />
                      <Label>Dark Mode</Label>
                    </div>
                    <ModeToggle />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
