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
import { AnimatePresence } from "motion/react";
import { motion } from "framer-motion";
import { registerInvestigator } from "@/actions/auth/register-investigator";

const formSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  gender: z.enum(["MALE", "FEMALE"], {
    message: "You need to select your gender",
  }),
  institution: z.string().min(1),
  institutionAddress: z.string().min(1),
  institutionContactNumber: z.string().min(10),
  investigatorRole: z.enum(["Principal Investigator", "Sub-Investigator"], {
    message: "You need to select your role",
  }),
});

export default function RegisterInvestigatorForm({
  className,
}: {
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const t = useTranslations("RegisterPage");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      institution: "",
      institutionAddress: "",
      institutionContactNumber: "",
      investigatorRole: "Principal Investigator",
      gender: "MALE",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    try {
      const { confirmPassword, ...rest } = values;
      const data = await registerInvestigator(rest);
      if ("error" in data) {
        setError(data.error);
      } else {
        router.push("/auth/login");
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

  // function handleGoogleClick() {
  //   console.log("Google clicked");
  // }

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
              <AnimatePresence>
                {activeTab === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ x: 100 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex gap-4 max-md:flex-col">
                      <div className="w-full">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("firstName")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Bilal"
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
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("lastName")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Arab"
                                  {...field}
                                />
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
                                  placeholder="bilal@example.com"
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
                                      onClick={() =>
                                        setShowPassword((prev) => !prev)
                                      }
                                    />
                                  ) : (
                                    <Eye
                                      className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                                      onClick={() =>
                                        setShowPassword((prev) => !prev)
                                      }
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
                    <div className="flex gap-4 max-md:flex-col">
                      <div className="w-full">
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("confirmPassword")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="******"
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    {...field}
                                  />
                                  {showConfirmPassword ? (
                                    <EyeOff
                                      className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                                      onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                      }
                                    />
                                  ) : (
                                    <Eye
                                      className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform hover:cursor-pointer"
                                      onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                      }
                                    />
                                  )}
                                </div>
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
                                  <SelectItem value="MALE">
                                    {t("male")}
                                  </SelectItem>
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {activeTab === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex gap-4 max-md:flex-col">
                      <div className="w-full">
                        <FormField
                          control={form.control}
                          name="institution"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("institution")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Institution Name"
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
                          name="institutionAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("institutionAddress")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Institution Address"
                                  {...field}
                                />
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
                          name="institutionContactNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("institutionContactNumber")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Institution Contact Number"
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
                          name="investigatorRole"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>{t("investigatorRole")}</FormLabel>
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
                                  <SelectItem value="Principal Investigator">
                                    Principal Investigator
                                  </SelectItem>
                                  <SelectItem value="Sub-Investigator">
                                    Sub-Investigator
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <FormError message={error} />

              {activeTab === 0 && (
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setActiveTab(1);
                  }}
                >
                  {t("next")}
                </Button>
              )}

              {activeTab === 1 && (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setActiveTab(0);
                    }}
                  >
                    {t("back")}
                  </Button>
                  <Button disabled={isLoading} type="submit" className="w-full">
                    {isLoading ? <LoadingSpinner /> : t("submit")}
                  </Button>
                </div>
              )}
            </form>
          </Form>
          <div className="mt-6 flex flex-col items-center gap-3 text-sm font-semibold">
            {/* <p>{t("continueWith")}</p>
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={handleGoogleClick}
              asChild
            >
              <FcGoogle size={25} />
            </Button> */}
            <Button variant="link" className="w-full cursor-pointer">
              <Link href={"/auth/login"}>{t("account")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
