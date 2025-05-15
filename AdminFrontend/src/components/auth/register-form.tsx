"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { FcGoogle } from "react-icons/fc";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { useState } from "react";

import { useTranslations } from "next-intl";
import FormError from "./form-error";
import { Link, useRouter } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../shared/loading-spinner";
import { register } from "@/api-access/server-side-data-access/actions/auth/register";
import { useCurrentUser } from "@/hooks/use-current-user";

const formSchema = z.object({
  // firstName: z.string().min(2),
  userName: z.string().min(8).nonempty(),
  email: z.string().email().nonempty(),
  password: z.string().min(8).nonempty(),
});

export default function RegisterForm({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { refreshUser } = useCurrentUser();
  const router = useRouter();

  const t = useTranslations("RegisterPage");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      // lastName: "",
      // hospital: "",
      // gender: "MALE",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const data = await register(values);
      if ("error" in data) {
        setError(data.error);
      } else {
        await refreshUser();

        router.push("/dashboard");
        toast({
          title: t("toast.title"),
          description: t("toast.description"),
        });
      }
    } catch (error) {
      console.log("Error", error);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleClick() {
    console.log("Google clicked");
  }

  return (
    <div className={cn("m-4 w-4/5", className)}>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex gap-4 max-md:flex-col">
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("userName")}</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Ilyes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex gap-4 max-md:flex-col">
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ilyes@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("password")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="******"
                              type={showPassword ? "text" : "password"}
                              {...field}
                            />
                            {showPassword ? (
                              <EyeOff
                                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                                onClick={() => setShowPassword((prev) => !prev)}
                              />
                            ) : (
                              <Eye
                                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                                onClick={() => setShowPassword((prev) => !prev)}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* <div className="flex gap-4 max-md:flex-col">
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="hospital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hospital")}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("hospitalPlaceHolder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("gender")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">{t("male")}</SelectItem>
                            <SelectItem value="FEMALE">
                              {t("female")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div> */}
              <FormError message={error} />
              <Button disabled={isLoading} type="submit" className="w-full">
                {isLoading ? <LoadingSpinner /> : t("submit")}
              </Button>
            </form>
          </Form>
          {/* <div className="mt-6 flex flex-col items-center gap-3 text-sm font-semibold">
            <p>{t("continueWith")}</p>
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={handleGoogleClick}
              asChild
            >
              <FcGoogle size={25} />
            </Button>
            <Button variant="link" className="w-full cursor-pointer">
              <Link href={"/auth/login"}>{t("account")}</Link>
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
