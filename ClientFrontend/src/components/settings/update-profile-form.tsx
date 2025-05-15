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
import updateDoctorData from "@/actions/doctors/update-doctor-data";
import { Activity, Hospital, Mail, MapPin, Phone, User } from "lucide-react";
import { Doctor } from "@/typings/doctors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const formSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  speciality: z
    .enum(
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
    )
    .optional(),
  phoneNumber: z.string().min(10).optional(),
  address: z.string().min(1).optional(),
  hospital: z.string().min(2).optional(),
});

export default function UpdateProfileForm({ doctor }: { doctor: Doctor }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: undefined,
      firstName: undefined,
      lastName: undefined,
      speciality: undefined,
      hospital: undefined,
      phoneNumber: undefined,
      address: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const data = await updateDoctorData(values);

      if ("error" in data) {
        setError(data.error);
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully",
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
        <div className="grid grid-cols-2 gap-4 max-md:flex-col">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <Input
                      disabled
                      className="bg-muted"
                      placeholder={doctor.account.email}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={doctor.doctor.firstName}
                      {...field}
                    />
                  </div>
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
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={doctor.doctor.lastName}
                      {...field}
                    />
                  </div>
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
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={doctor.doctor.phoneNumber}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="speciality"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Speciality</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={doctor.doctor.speciality}
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
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hospital"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Hospital</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Hospital className="h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={doctor.doctor.hospital || ""}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={doctor.doctor.address || ""}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormError message={error} />
        <Button type="submit" className="mt-2 w-fit self-end">
          {isLoading ? <LoadingSpinner /> : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
}
