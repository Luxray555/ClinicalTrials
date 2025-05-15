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
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import FormError from "../auth/form-error";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/typings/patients";
import updatePatientData from "@/actions/doctors/update-patient-data";
import LoadingSpinner from "../shared/loading-spinner";

const formSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  dateOfBirth: z.date().optional(),
  phoneNumber: z.string().optional(),
  postalCode: z.string().optional(),
  healthStatus: z
    .enum([
      "STABLE",
      "IMPROVING",
      "DETERIORATING",
      "CRITICAL",
      "RECOVERED",
      "UNDER_TREATMENT",
      "UNKNOWN",
    ])
    .optional(),
  medicalHistory: z.string().optional(),
});

export default function EditPatientForm({
  patient,
  setOpenEdit,
}: {
  patient: Patient;
  setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: undefined,
      password: undefined,
      firstName: patient.patient.firstName,
      lastName: patient.patient.lastName,
      dateOfBirth: undefined,
      gender: patient.patient.gender,
      phoneNumber: patient.patient.phoneNumber,
      postalCode: patient.patient.postalCode,
      healthStatus: patient.patient.healthStatus,
      medicalHistory: patient.patient.medicalHistory,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const data = await updatePatientData(
        {
          ...values,
          dateOfBirth: values.dateOfBirth
            ? format(values.dateOfBirth, "yyyy-MM-dd")
            : undefined,
        },
        patient.patient.id,
      );
      if ("error" in data) {
        setError(data.error);
      } else {
        setOpenEdit(false);
        toast({
          title: "Patient updated",
          description: "The patient data has been updated successfully",
        });
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
        <div className="flex gap-4 max-md:flex-col">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder={patient.account.email} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Password</FormLabel>
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
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Gender</FormLabel>
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
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 max-md:flex-col">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-full">
                {" "}
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="w-full">
                {" "}
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 max-md:flex-col">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{patient.patient.dateOfBirth.toString()}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      className="pointer-events-auto"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="healthStatus"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Health status</FormLabel>
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
                    <SelectItem value="STABLE">Stable</SelectItem>
                    <SelectItem value="IMPROVING">Improving</SelectItem>
                    <SelectItem value="DETERIORATING">Deteriorating</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="RECOVERED">Recovered</SelectItem>
                    <SelectItem value="UNDER_TREATMENT">
                      Under Treatment
                    </SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 max-md:flex-col">
          <FormField
            control={form.control}
            name="medicalHistory"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Medical history</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormError message={error} />
        <Button type="submit">
          {isLoading ? <LoadingSpinner /> : "Update patient"}
        </Button>
      </form>
    </Form>
  );
}
