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

// import { FcGoogle } from "react-icons/fc";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslations } from "next-intl";
import FormError from "./form-error";
import { useRouter } from "@/i18n/routing";
import login from "@/api-access/server-side-data-access/actions/auth/login";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../shared/loading-spinner";
import { useCurrentUser } from "@/hooks/use-current-user";
const formSchema = z.object({
  email: z.string().email().min(1, "Email is required"),
  password: z.string().min(6),
});

export default function LoginForm({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const { refreshUser } = useCurrentUser();
  const { toast } = useToast();
  const router = useRouter();

  const t = useTranslations("LoginPage");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: { email: string; password: string }) {
    setIsLoading(true);
    setError("");
    try {
      const data = await login(values);
      if ("error" in data) {
        setError(data.error);
      } else if ("success" in data) {
        toast({
          title: t("toast.title"),
          description: t("toast.description"),
        });
        await refreshUser();
        router.push("/dashboard");
      }
    } catch (error) {
      console.log("Error", error);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // function handleGoogleClick() {
  //   console.log("Google clicked");
  // }

  return (
    <div className={cn("m-4 w-full max-md:w-4/5", className)}>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Link href={"/auth/register"}>{t("account")}</Link>
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
