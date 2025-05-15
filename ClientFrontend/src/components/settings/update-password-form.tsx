"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import FormError from "../auth/form-error";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../shared/loading-spinner";
import { Eye, EyeOff, Lock } from "lucide-react";
import updateDoctorPassword from "@/actions/doctors/update-doctor-password";

const formSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmNewPassword: z.string().min(6),
});

export default function UpdatePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");
    if (values.newPassword !== values.confirmNewPassword) {
      setError("Make sure the new passwords match");
      setIsLoading(false);
      return;
    }
    try {
      const data = await updateDoctorPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      if ("error" in data) {
        setError(data.error);
      } else {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        form.reset();
      }
    } catch (error) {
      console.log("Error", error);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <div className="flex flex-col gap-4 max-md:flex-col">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Old password</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div className="relative w-full">
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        placeholder="Old password"
                        {...field}
                      />
                      {showOldPassword ? (
                        <EyeOff
                          className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                          onClick={() => setShowOldPassword((prev) => !prev)}
                        />
                      ) : (
                        <Eye
                          className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                          onClick={() => setShowOldPassword((prev) => !prev)}
                        />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div className="relative w-full">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New password"
                        {...field}
                      />
                      {showNewPassword ? (
                        <EyeOff
                          className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                        />
                      ) : (
                        <Eye
                          className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                        />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div className="relative w-full">
                      <Input
                        type={showConfirmNewPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...field}
                      />
                      {showConfirmNewPassword ? (
                        <EyeOff
                          className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                          onClick={() =>
                            setShowConfirmNewPassword((prev) => !prev)
                          }
                        />
                      ) : (
                        <Eye
                          className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                          onClick={() =>
                            setShowConfirmNewPassword((prev) => !prev)
                          }
                        />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormError message={error} />
        <Button type="submit" className="mt-2 w-fit self-end">
          {isLoading ? <LoadingSpinner /> : "Update Password"}
        </Button>
      </form>
    </Form>
  );
}
