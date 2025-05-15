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
import LoadingSpinner from "../shared/loading-spinner";
import { CollaboratorsInput } from "./collaborators-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationsInput } from "./locations-input";
import { ContactsInput } from "./contacts-input";
import { InterventionsInput } from "./interventions-input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { ConditionsInput } from "./conditions-input";
import { ClinicalTrial } from "@/typings/clinical-trials";
import editClinicalTrial from "@/actions/investigator/edit-clinical-trial";

const formSchema = z.object({
  title: z.string().optional(),
  status: z.enum([
    "COMPLETED",
    "NOT_YET_RECRUITING",
    "UNKNOWN",
    "ACTIVE_NOT_RECRUITING",
    "WITHDRAWN",
    "TERMINATED",
    "RECRUITING",
    "SUSPENDED",
    "ENROLLING_BY_INVITATION",
    "APPROVED_FOR_MARKETING",
    "NO_LONGER_AVAILABLE",
    "TEMPORARILY_NOT_AVAILABLE",
  ]),
  summary: z.string().optional(),
  currentEnrollmentCount: z.number().int().min(0),
  type: z.enum(["INTERVENTIONAL", "OBSERVATIONAL", "EXPANDED_ACCESS"]),
  phase: z.enum(["NA", "PHASE1", "PHASE2", "PHASE3", "PHASE4", "EARLY_PHASE1"]),
  sponsor: z.object({ name: z.string().min(1) }),
  collaborators: z
    .array(z.object({ name: z.string().min(1) }))
    .min(1, "At least one collaborator is required"),
  interventions: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        type: z.enum([
          "DEVICE",
          "DRUG",
          "OTHER",
          "DIAGNOSTIC_TEST",
          "BIOLOGICAL",
          "PROCEDURE",
          "BEHAVIORAL",
          "DIETARY_SUPPLEMENT",
          "COMBINATION_PRODUCT",
          "RADIATION",
          "GENETIC",
        ]),
      }),
    )
    .min(1, "At least one intervention is required"),
  dates: z.object({
    startDate: z.date().optional(),
    estimatedCompletionDate: z.date().optional(),
  }),

  eligibility: z.object({
    eligibilityCriteria: z.string().min(1),
    gender: z.enum(["MALE", "FEMALE", "ALL"]),
    minAge: z.number().int().min(0).max(100),
    maxAge: z.number().int().min(0).max(100),
  }),
  conditions: z
    .array(
      z.object({
        name: z.string().min(1),
      }),
    )
    .min(1, "At least one condition is required"),
  locations: z
    .array(
      z.object({
        country: z.string().min(1),
        city: z.string().min(1),
        latitude: z.number(),
        longitude: z.number(),
        facility: z.string().min(1),
      }),
    )
    .min(1, "At least one location is required"),
  organization: z.string().min(1),
  contacts: z
    .array(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        isMainContact: z.boolean(),
      }),
    )
    .min(1, "At least one contact is required"),
});

export default function EditClinicalTrialForm({
  trial,
  setOpenEdit,
}: {
  trial: ClinicalTrial;
  setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: trial.title,
      status: trial.status,
      summary: trial.summary,
      currentEnrollmentCount: trial.currentEnrollmentCount,
      type: trial.type,
      phase: trial.phase,
      sponsor: { name: trial.sponsor?.name ?? "" },
      collaborators:
        trial.collaborators!.map((collaborator) => {
          return { name: collaborator.name ?? "" };
        }) ?? [],
      interventions:
        trial.interventions!.map((intervention) => {
          return {
            name: intervention.name ?? "",
            description: intervention.description ?? "",
            type:
              (intervention.type as
                | "DEVICE"
                | "DRUG"
                | "OTHER"
                | "DIAGNOSTIC_TEST"
                | "BIOLOGICAL"
                | "PROCEDURE"
                | "BEHAVIORAL"
                | "DIETARY_SUPPLEMENT"
                | "COMBINATION_PRODUCT"
                | "RADIATION"
                | "GENETIC") ?? "DEVICE",
          };
        }) ?? [],
      dates: undefined,
      eligibility: {
        eligibilityCriteria: trial.eligibility?.eligibilityCriteria ?? "",
        gender: trial.eligibility?.gender ?? "ALL",
        minAge: trial.eligibility?.minAge ?? 0,
        maxAge: trial.eligibility?.maxAge ?? 0,
      },
      conditions:
        trial.conditions!.map((condition) => {
          return {
            name: condition.name ?? "",
          };
        }) ?? [],
      locations:
        trial.locations!.map((location) => {
          return {
            country: location.country ?? "",
            city: location.city ?? "",
            latitude: location.latitude ?? 0,
            longitude: location.longitude ?? 0,
            facility: location.facility ?? "",
          };
        }) ?? [],
      organization: trial.organization,
      contacts:
        trial.contacts!.map((contact) => {
          return {
            name: contact.name ?? "",
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            isMainContact: contact.isMainContact ?? false,
          };
        }) ?? [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const data = await editClinicalTrial({
        trialData: {
          ...values,
          dates: {
            startDate: values.dates.startDate
              ? format(values.dates.startDate, "yyyy-MM-dd")
              : trial.dates?.startDate,
            estimatedCompletionDate: values.dates.estimatedCompletionDate
              ? format(values.dates.estimatedCompletionDate, "yyyy-MM-dd")
              : trial.dates?.estimatedCompletionDate,
          },
        },
        trialId: trial.id,
      });
      if ("error" in data) {
        setError(data.error);
      } else {
        setOpenEdit(false);
        toast({
          title: "Clinical trial updated",
          description: "The clinical trial has been updated successfully",
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
        <Tabs
          defaultValue="general-informations"
          className="flex w-full flex-col items-center"
        >
          <TabsList className="">
            <TabsTrigger value="general-informations">
              General informations
            </TabsTrigger>
            <TabsTrigger value="contacts-and-locations">
              Contacts & locations
            </TabsTrigger>
            <TabsTrigger value="eligibility-criteria">
              Eligebility criteria
            </TabsTrigger>
          </TabsList>
          <TabsContent className="w-full" value="general-informations">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Status</FormLabel>
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
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="NOT_YET_RECRUITING">
                          Not Yet Recruiting
                        </SelectItem>
                        <SelectItem value="UNKNOWN">Unknown</SelectItem>
                        <SelectItem value="ACTIVE_NOT_RECRUITING">
                          Active Not Recruiting
                        </SelectItem>
                        <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                        <SelectItem value="RECRUITING">Recruiting</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="ENROLLING_BY_INVITATION">
                          Enrolling by Invitation
                        </SelectItem>
                        <SelectItem value="APPROVED_FOR_MARKETING">
                          Approved for Marketing
                        </SelectItem>
                        <SelectItem value="NO_LONGER_AVAILABLE">
                          No Longer Available
                        </SelectItem>
                        <SelectItem value="TEMPORARILY_NOT_AVAILABLE">
                          Temporarily Not Available
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Type</FormLabel>
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
                        <SelectItem value="INTERVENTIONAL">
                          Interventional
                        </SelectItem>
                        <SelectItem value="OBSERVATIONAL">
                          Observational
                        </SelectItem>
                        <SelectItem value="EXPANDED_ACCESS">
                          Expanded Access
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phase"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Phase</FormLabel>
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
                        <SelectItem value="NA">Not Applicable</SelectItem>
                        <SelectItem value="PHASE1">Phase 1</SelectItem>
                        <SelectItem value="PHASE2">Phase 2</SelectItem>
                        <SelectItem value="PHASE3">Phase 3</SelectItem>
                        <SelectItem value="PHASE4">Phase 4</SelectItem>
                        <SelectItem value="EARLY_PHASE1">
                          Early Phase 1
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentEnrollmentCount"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Current enrollment count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dates.startDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{trial.dates?.startDate}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dates.estimatedCompletionDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Estimated completion date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>
                                {trial.dates?.estimatedCompletionDate}
                              </span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          <TabsContent className="w-full" value="contacts-and-locations">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="sponsor.name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Sponsor</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collaborators"
                render={({ field }) => (
                  <FormItem className="col-span-2 w-full">
                    <FormLabel>Collaborators</FormLabel>
                    <FormControl>
                      <CollaboratorsInput field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locations"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Locations</FormLabel>
                    <FormControl>
                      <LocationsInput field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contacts"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Contacts</FormLabel>
                    <FormControl>
                      <ContactsInput field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          <TabsContent className="w-full" value="eligibility-criteria">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="eligibility.eligibilityCriteria"
                render={({ field }) => (
                  <FormItem className="col-span-3 w-full">
                    <FormLabel>Eligibility criteria</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eligibility.gender"
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
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eligibility.minAge"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Minimmum age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eligibility.maxAge"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Maximmum age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interventions"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Interventions</FormLabel>
                    <FormControl>
                      <InterventionsInput field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conditions"
                render={({ field }) => (
                  <FormItem className="col-span-2 w-full">
                    <FormLabel>Conditions</FormLabel>
                    <FormControl>
                      <ConditionsInput field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
        <FormError message={error} />
        <Button type="submit">
          {isLoading ? <LoadingSpinner /> : "Update clinical trial"}
        </Button>
      </form>
    </Form>
  );
}
