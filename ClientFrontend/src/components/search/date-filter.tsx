"use client";

import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

type Props = {
  dates: {
    startDate?: Date;
    completionDate?: Date;
  };
  handleDateChange: (
    key: "startDate" | "completionDate",
  ) => (date: Date | undefined) => void;
};

export default function DateFilter({
  dates: { startDate, completionDate },
  handleDateChange,
}: Props) {
  const t = useTranslations("SearchPage.filtersSideBar");

  return (
    <div className="flex flex-col gap-2">
      <label className="w-fit font-bold text-primary">
        {t("dateRange.label")}
      </label>
      <div className="flex flex-col gap-2 pl-2">
        <p className="w-fit font-semibold">{t("dateRange.studyStartDate")}</p>
        <div className="flex w-fit items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] pl-3 text-left font-normal",
                  !startDate && "text-muted-foreground",
                )}
              >
                {startDate ? (
                  format(startDate, "PPP")
                ) : (
                  <span>{t("dateRange.placeholder")}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleDateChange("startDate")}
                toYear={new Date().getFullYear() + 20}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-2">
        <p className="w-fit font-semibold">
          {t("dateRange.primaryCompletionDate")}
        </p>
        <div className="flex w-fit items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] pl-3 text-left font-normal",
                  !completionDate && "text-muted-foreground",
                )}
              >
                {completionDate ? (
                  format(completionDate, "PPP")
                ) : (
                  <span>{t("dateRange.placeholder")}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={completionDate}
                onSelect={handleDateChange("completionDate")}
                toYear={new Date().getFullYear() + 20}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
