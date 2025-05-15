"use client";

import { useState } from "react";
import { useGlobalApp } from "@@/providers/app-global-context-provider";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dataSourceSchema } from "./data-table";
import { runPipeline } from "@/api-access/server-side-data-access/actions/data-sources/run-pipeline";
import { ClinicalTrialStatusEnum } from "@/typings";
import { useTranslations } from "next-intl";

export function RunPipelineModal({
  isOpen,
  onClose,
  dataSource,
}: {
  isOpen: boolean;
  onClose: () => void;
  dataSource: z.infer<typeof dataSourceSchema>;
}) {
  const t = useTranslations("RunPipelineModal");
  const { executeServerAction } = useGlobalApp();
  const [activeTab, setActiveTab] = useState("filters"); // Default to filters as basic is commented out

  const runPipelineSchema = z.object({
    numberOfTrials: z
      .number()
      .optional()
      .refine(
        (value) => value === undefined || (value >= 100 && value % 100 === 0),
        {
          message: t("validation.numberOfTrialsMultiple"),
        },
      ),
    startingFrom: z
      .number()
      .optional()
      .refine((value) => value === undefined || value % 100 === 0, {
        message: t("validation.startingFromMultiple"),
      }),
    startYear: z.number().optional(),
    endYear: z.number().optional(),
    // status: z.array(z.string()).optional(),
    // country: z.string().optional(),
    // conditions: z.array(z.string()).optional(),
  });

  type RunPipelineValues = z.infer<typeof runPipelineSchema>;

  const statusOptions = [
    {
      id: ClinicalTrialStatusEnum.COMPLETED,
      label: t("statusOptions.completed"),
    },
    {
      id: ClinicalTrialStatusEnum.RECRUITING,
      label: t("statusOptions.recruiting"),
    },
    {
      id: ClinicalTrialStatusEnum.NOT_YET_RECRUITING,
      label: t("statusOptions.notYetRecruiting"),
    },
    {
      id: ClinicalTrialStatusEnum.ACTIVE_NOT_RECRUITING,
      label: t("statusOptions.activeNotRecruiting"),
    },
    {
      id: ClinicalTrialStatusEnum.TERMINATED,
      label: t("statusOptions.terminated"),
    },
    {
      id: ClinicalTrialStatusEnum.WITHDRAWN,
      label: t("statusOptions.withdrawn"),
    },
    { id: ClinicalTrialStatusEnum.UNKNOWN, label: t("statusOptions.unknown") },
    {
      id: ClinicalTrialStatusEnum.SUSPENDED,
      label: t("statusOptions.suspended"),
    },
    {
      id: ClinicalTrialStatusEnum.ENROLLING_BY_INVITATION,
      label: t("statusOptions.enrollingByInvitation"),
    },
    {
      id: ClinicalTrialStatusEnum.APPROVED_FOR_MARKETING,
      label: t("statusOptions.approvedForMarketing"),
    },
    {
      id: ClinicalTrialStatusEnum.NO_LONGER_AVAILABLE,
      label: t("statusOptions.noLongerAvailable"),
    },
    {
      id: ClinicalTrialStatusEnum.TEMPORARILY_NOT_AVAILABLE,
      label: t("statusOptions.temporarilyNotAvailable"),
    },
  ];

  // Define condition options (this would typically come from an API)
  // const conditionOptions = [
  //   { id: "cancer", label: t("conditionOptions.cancer") },
  //   { id: "diabetes", label: t("conditionOptions.diabetes") },
  //   { id: "covid-19", label: t("conditionOptions.covid19") },
  //   { id: "alzheimers", label: t("conditionOptions.alzheimers") },
  //   { id: "heart_disease", label: t("conditionOptions.heartDisease") },
  // ];

  // Define countries
  // const countryOptions = [
  //   { id: "us", label: t("countryOptions.us") },
  //   { id: "gb", label: t("countryOptions.gb") },
  //   { id: "ca", label: t("countryOptions.ca") },
  //   { id: "au", label: t("countryOptions.au") },
  //   { id: "fr", label: t("countryOptions.fr") },
  //   { id: "de", label: t("countryOptions.de") },
  // ];

  const form = useForm<RunPipelineValues>({
    resolver: zodResolver(runPipelineSchema),
    defaultValues: {
      numberOfTrials: 100,
      startingFrom: 0,
      // startYear: new Date().getFullYear() - 5,
      // endYear: new Date().getFullYear(),
      // status: [],
      // country: undefined,
      // conditions: [],
    },
  });

  const onSubmit = async (data: RunPipelineValues) => {
    try {
      await executeServerAction(() => runPipeline(dataSource.slug, data), {
        success: t("successMessage", { name: dataSource.name }),
      });
      onClose();
    } catch (error) {
      console.error("Failed to start pipeline:", error);
      // Optionally show an error message to the user using t()
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overscroll-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: dataSource.name })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-h-screen space-y-6 overflow-y-auto"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                {/* <TabsTrigger value="basic" className="flex-1">
                  {t("tabs.basic")}
                </TabsTrigger> */}
                <TabsTrigger value="filters" className="flex-1">
                  {t("tabs.filters")}
                </TabsTrigger>
              </TabsList>

              {/* <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="numberOfTrials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("basicSettings.numberOfTrials.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="100"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("basicSettings.numberOfTrials.description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startingFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("basicSettings.startingFrom.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="100"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("basicSettings.startingFrom.description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent> */}

              <TabsContent
                value="filters"
                className="max-h-80 space-y-6 overflow-y-auto pt-4"
              >
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="numberOfTrials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("filters.numberOfTrials.label")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="100"
                            min={100}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("filters.numberOfTrials.description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startingFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("filters.startingFrom.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="100"
                            min={0}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("filters.startingFrom.description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("filters.startYear.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("filters.endYear.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> */}

                {/* <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("filters.country.label")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("filters.country.placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countryOptions.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t("filters.country.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <Accordion type="single" collapsible className="w-full">
                  {/* <AccordionItem value="status">
                    <AccordionTrigger>{t("filters.status.trigger")}</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="status"
                        render={() => (
                          <FormItem>
                            <div className="grid grid-cols-2 gap-2">
                              {statusOptions.map((status) => (
                                <FormField
                                  key={status.id}
                                  control={form.control}
                                  name="status"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={status.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              status.id,
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...(field.value || []),
                                                    status.id,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== status.id,
                                                    ),
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {status.label}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormDescription>
                             {t("filters.status.description")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem> */}

                  {/* <AccordionItem value="conditions">
                    <AccordionTrigger>{t("filters.conditions.trigger")}</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="conditions"
                        render={() => (
                          <FormItem>
                            <div className="grid grid-cols-2 gap-2">
                              {conditionOptions.map((condition) => (
                                <FormField
                                  key={condition.id}
                                  control={form.control}
                                  name="conditions"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={condition.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              condition.id,
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...(field.value || []),
                                                    condition.id,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== condition.id,
                                                    ),
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {condition.label}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormDescription>
                              {t("filters.conditions.description")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem> */}
                </Accordion>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                {t("buttons.cancel")}
              </Button>
              <Button type="submit">{t("buttons.start")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
