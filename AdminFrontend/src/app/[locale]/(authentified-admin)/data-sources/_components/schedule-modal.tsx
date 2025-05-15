"use client";

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
import { Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dataSourceSchema } from "./data-table";
import { updateDataSourceSchedule } from "@/api-access/server-side-data-access/actions/data-sources/update-schedule";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { DayOfWeek } from "@/lib/constants";

const frequencyEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY", "MANUAL"]);
const dayOfWeekEnum = z.enum([
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
  "not set",
]);

const NotSet = z.literal("not set");

export const scheduleFormSchema = z.object({
  frequency: frequencyEnum.or(NotSet),
  dayOfWeek: dayOfWeekEnum.or(NotSet).optional(),
  dayOfMonth: z.union([z.string().regex(/^\d+$/), NotSet]).optional(),
  timeOfDay: z.string().or(NotSet).optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export function ScheduleModal({
  isOpen,
  onClose,
  dataSource,
}: {
  isOpen: boolean;
  onClose: () => void;
  dataSource: z.infer<typeof dataSourceSchema>;
}) {
  const t = useTranslations("ScheduleModal");
  const { executeServerAction } = useGlobalApp();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      ...dataSource.schedule,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        frequency: dataSource?.schedule?.frequency || "not set",
        dayOfWeek: dataSource?.schedule?.dayOfWeek || "not set",
        dayOfMonth: dataSource?.schedule?.dayOfMonth?.toString() || "not set",
        timeOfDay: dataSource?.schedule?.timeOfDay || "not set",
      });
    }
  }, [isOpen, dataSource, form]);

  const frequency = form.watch("frequency");

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      await executeServerAction(
        () =>
          updateDataSourceSchedule(dataSource.id, {
            ...data,
          }),
        { success: t("successMessage", { name: dataSource.name }) },
      );
      onClose();
    } catch (error) {
      console.error("Failed to update schedule:", error);
      // Optionally show an error message to the user here
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: dataSource.name })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("frequency.label")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("frequency.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DAILY">
                        {t("frequency.options.daily")}
                      </SelectItem>
                      <SelectItem value="WEEKLY">
                        {t("frequency.options.weekly")}
                      </SelectItem>
                      <SelectItem value="MONTHLY">
                        {t("frequency.options.monthly")}
                      </SelectItem>
                      <SelectItem value="MANUAL">
                        {t("frequency.options.manual")}
                      </SelectItem>
                      <SelectItem value="not set">
                        {t("frequency.options.notSet")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("frequency.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {frequency === "WEEKLY" && (
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dayOfWeek.label")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("dayOfWeek.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONDAY">
                          {t("dayOfWeek.options.monday")}
                        </SelectItem>
                        <SelectItem value="TUESDAY">
                          {t("dayOfWeek.options.tuesday")}
                        </SelectItem>
                        <SelectItem value="WEDNESDAY">
                          {t("dayOfWeek.options.wednesday")}
                        </SelectItem>
                        <SelectItem value="THURSDAY">
                          {t("dayOfWeek.options.thursday")}
                        </SelectItem>
                        <SelectItem value="FRIDAY">
                          {t("dayOfWeek.options.friday")}
                        </SelectItem>
                        <SelectItem value="SATURDAY">
                          {t("dayOfWeek.options.saturday")}
                        </SelectItem>
                        <SelectItem value="SUNDAY">
                          {t("dayOfWeek.options.sunday")}
                        </SelectItem>
                        <SelectItem value="not set">
                          {t("dayOfWeek.options.notSet")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency === "MONTHLY" && (
              <FormField
                control={form.control}
                name="dayOfMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dayOfMonth.label")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("dayOfMonth.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not set">
                          {t("dayOfMonth.options.notSet")}
                        </SelectItem>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency !== "MANUAL" && frequency !== "not set" && (
              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("timeOfDay.label")}</FormLabel>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value === "not set" ? "" : field.value}
                        />
                      </FormControl>
                    </div>
                    <FormDescription>
                      {t("timeOfDay.description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                {t("buttons.cancel")}
              </Button>
              <Button type="submit">{t("buttons.save")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
