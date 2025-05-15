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
import { registerDoctor } from "@/actions/auth/register-doctor";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../shared/loading-spinner";
import { AnimatePresence } from "motion/react";
import { motion } from "framer-motion";

const formSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  phoneNumber: z.string().min(10),
  hospital: z.string().min(1),
  medicalLicenseNumber: z.string().min(1),
  speciality: z.enum(
    [
      "Medical Oncology",
      "Radiation Oncology",
      "Surgical Oncology",
      "Gynecologic Oncology",
      "Hematology-Oncology",
      "Pediatric Oncology",
      "Neuro-Oncology",
      "Thoracic Oncology",
      "Urologic Oncology",
      "Gastrointestinal Oncology",
      "Head and Neck Oncology",
      "Dermato-Oncology",
      "Breast Oncology",
      "Orthopedic Oncology",
      "Geriatric Oncology",
    ],
    {
      message: "You need to select your specialty",
    },
  ),
  gender: z.enum(["MALE", "FEMALE"], {
    message: "You need to select your gender",
  }),
  address: z.string().min(1),
});

export default function RegisterDoctorForm({
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
      hospital: "",
      confirmPassword: "",
      phoneNumber: "",
      address: "",
      medicalLicenseNumber: "",
      speciality: "Medical Oncology",
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
      const data = await registerDoctor(rest);
      if ("error" in data) {
        console.log(data);
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
                          name="speciality"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>{t("speciality")}</FormLabel>
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
                                  <SelectItem value="Medical Oncology">
                                    Medical Oncology
                                  </SelectItem>
                                  <SelectItem value="Radiation Oncology">
                                    Radiation Oncology
                                  </SelectItem>
                                  <SelectItem value="Surgical Oncology">
                                    Surgical Oncology
                                  </SelectItem>
                                  <SelectItem value="Gynecologic Oncology">
                                    Gynecologic Oncology
                                  </SelectItem>
                                  <SelectItem value="Hematology-Oncology">
                                    Hematology-Oncology
                                  </SelectItem>
                                  <SelectItem value="Pediatric Oncology">
                                    Pediatric Oncology
                                  </SelectItem>
                                  <SelectItem value="Neuro-Oncology">
                                    Neuro-Oncology
                                  </SelectItem>
                                  <SelectItem value="Thoracic Oncology">
                                    Thoracic Oncology
                                  </SelectItem>
                                  <SelectItem value="Urologic Oncology">
                                    Urologic Oncology
                                  </SelectItem>
                                  <SelectItem value="Gastrointestinal Oncology">
                                    Gastrointestinal Oncology
                                  </SelectItem>
                                  <SelectItem value="Head and Neck Oncology">
                                    Head and Neck Oncology
                                  </SelectItem>
                                  <SelectItem value="Dermato-Oncology">
                                    Dermato-Oncology
                                  </SelectItem>
                                  <SelectItem value="Breast Oncology">
                                    Breast Oncology
                                  </SelectItem>
                                  <SelectItem value="Orthopedic Oncology">
                                    Orthopedic Oncology
                                  </SelectItem>
                                  <SelectItem value="Geriatric Oncology">
                                    Geriatric Oncology
                                  </SelectItem>
                                </SelectContent>
                              </Select>
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
                          name="medicalLicenseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("medicalLicenseNumber")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="123456789"
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
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("phoneNumber")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="+213797422080"
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
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("address")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="1234 Main St"
                                  {...field}
                                />
                              </FormControl>
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
