"use client";

import React, { useState } from "react";
import { useGlobalApp } from "@@/providers/app-global-context-provider";
import {
  FileText,
  Clock,
  Calendar,
  PlayCircle,
  RefreshCw,
  Settings,
  Database,
  Globe,
  FileSpreadsheet,
  Square,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RunPipelineModal } from "../../_components/run-pipeline-modal";
import { ScheduleModal } from "../../_components/schedule-modal";
import { LogContextsTable } from "./history-logs-table";
import { usePipelines, useTrials } from "@@/providers/websocket-provider";
import { getPipelineSatusProps } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { refreshDataSource } from "@/api-access/server-side-data-access/actions/data-sources/refresh-pipeline";
import { stopPipeline } from "@/api-access/server-side-data-access/actions/data-sources/stop-pipeline";

function DataSourceDetails({
  dataSourceData,
}: {
  dataSourceData: {
    schedule: any;
    historyLogs: any;
    totalTrials: number;
    name: string;
    type: string;
    id: string;
    slug: string; // Added slug for pipeline status lookup
  };
}) {
  const t = useTranslations("DataSourceDetails");
  const scheduleT = useTranslations("ScheduleModal"); // For reusing day/frequency names
  const statusT = useTranslations("DataSourcesTable.status"); // For reusing status names
  const typeT = useTranslations("DataSourcesTable.type"); // For reusing type names

  const { executeServerAction } = useGlobalApp();
  const [isRunPipelineModalOpen, setIsRunPipelineModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const { id, name, type, totalTrials, schedule, slug } = dataSourceData;
  const trialsPerSource = useTrials();

  // the total trials , i can make it gotten from a websocket ?
  // either a cron job to emit the states in here , or after insertion.

  const formatSchedule = (scheduleData: any) => {
    if (
      !scheduleData ||
      !scheduleData.frequency ||
      scheduleData.frequency === "MANUAL" ||
      scheduleData.frequency === "not set"
    ) {
      return scheduleT("frequency.options.manual"); // Or a specific "Not Configured" message
    }

    const {
      frequency,
      timeOfDay = "N/A",
      dayOfMonth,
      dayOfWeek,
    } = scheduleData;
    const formattedTime =
      timeOfDay === "not set" || !timeOfDay ? "" : timeOfDay;
    const timeString = formattedTime
      ? ` ${t("schedule.atTime")} ${formattedTime}`
      : "";

    switch (frequency) {
      case "DAILY":
        return `${scheduleT("frequency.options.daily")}${timeString}`;
      case "WEEKLY": {
        const dayKey = dayOfWeek?.toLowerCase() || "notSet";
        const dayName = scheduleT(`dayOfWeek.options.${dayKey}` as any);
        return `${scheduleT("frequency.options.weekly")} ${t("schedule.onDay")} ${dayName}${timeString}`;
      }
      case "MONTHLY": {
        const day = dayOfMonth === "not set" || !dayOfMonth ? "" : dayOfMonth;
        const dayString = day ? ` ${t("schedule.onDayOfMonth")} ${day}` : "";
        return `${scheduleT("frequency.options.monthly")}${dayString}${timeString}`;
      }
      default:
        // Fallback for potentially unknown frequency types or "MANUAL"
        const freqKey = `frequency.options.${frequency.toLowerCase()}`;
        return scheduleT(freqKey as any, {}, frequency); // Display raw value if translation missing
    }
  };

  const nextSync = schedule?.nextSync || t("schedule.notScheduled");

  const getTypeIcon = () => {
    switch (type) {
      case "API":
        return <Database className="h-6 w-6" />;
      case "Website Scraper":
        return <Globe className="h-6 w-6" />;
      case "INVESTIGATOR":
        return <FileSpreadsheet className="h-6 w-6" />;
      default:
        return <Database className="h-6 w-6" />;
    }
  };

  const handleRunPipeline = () => {
    setIsRunPipelineModalOpen(true);
  };

  const handleStopPipeline = () => {
    executeServerAction(
      () => stopPipeline(slug),
      {
        success: t("stopNow.toastSuccess"),
        error: t("stopNow.toastError"),
      },
      {
        message: t("stopNow.description"),
        title: t("stopNow.title"),
        confirmButtonText: t("stopNow.confirmButtonText"),
      },
    );
  };

  const handleRefreshNow = () => {
    executeServerAction(
      () => refreshDataSource(slug), // Assuming refreshDataSource exists and returns a promise
      {
        success: t("refreshNow.toastSuccess"),
        error: t("refreshNow.toastError"),
      },
      {
        message: t("refreshNow.description"),
        title: t("refreshNow.title"),
        confirmButtonText: t("refreshNow.confirmButtonText"),
      },
    );
  };

  const handleConfigureSchedule = () => {
    setIsScheduleModalOpen(true);
  };

  const pipelines = usePipelines();
  const state = pipelines.collectionPipelines[name] || "idle"; // Use slug here if that's the key
  const refreshState = pipelines.refreshPipelines[name] || "not refreshing"; // Use slug here if that's the key
  const { text, className, variant } = getPipelineSatusProps(state);
  const translatedStatus = statusT(text.toLowerCase() as any, {}, text); // Translate status text
  const {
    text: refreshText,
    className: refreshClassName,
    variant: refreshVariant,
  } = getPipelineSatusProps(refreshState);
  const translatedRefreshStatus = statusT(
    refreshText.toLowerCase() as any,
    {},
    refreshText,
  ); // Translate status text

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getTypeIcon()}
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant={variant as any} className={className}>
            {translatedStatus}
          </Badge>

          {refreshState != "not refreshing" && (
            <Badge variant={refreshVariant as any} className={refreshClassName}>
              {translatedRefreshStatus}
            </Badge>
          )}

          <Button
            variant="outline"
            onClick={handleRefreshNow}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("buttons.refreshNow")}
          </Button>

          {state != "running" ? (
            <Button
              onClick={handleRunPipeline}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              {t("buttons.runPipeline")}
            </Button>
          ) : (
            <Button
              onClick={handleStopPipeline}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              {t("buttons.stopPipeline")}
            </Button>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1 dark:from-blue-950/40 dark:to-indigo-950/40">
          <div className="flex h-full flex-col bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-center p-6">
              <div className="flex flex-col items-center text-center">
                <FileText className="mb-2 h-12 w-12 text-primary" />
                <h2 className="text-3xl font-bold">
                  {/* {totalTrials.toLocaleString()} */}
                  {trialsPerSource[name] || totalTrials.toLocaleString()}
                </h2>
                <p className="text-muted-foreground">
                  {t("totalTrialsCard.title")}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 p-1 dark:from-indigo-950/40 dark:to-blue-950/40">
          <div className="flex h-full flex-col bg-card/50 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {t("scheduleCard.title")}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleConfigureSchedule}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  {t("buttons.configure")}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("scheduleCard.frequencyLabel")}
                    </p>
                    <p className="font-medium">{formatSchedule(schedule)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("scheduleCard.nextSyncLabel")}
                    </p>
                    <p className="font-medium">{nextSync}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="details" className="mt-8">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details">{t("tabs.details")}</TabsTrigger>
          <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
          {/* <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger> */}
        </TabsList>

        <TabsContent
          value="details"
          className="mt-6 rounded-md bg-muted/10 p-4"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                {t("detailsTab.title")}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm font-medium">
                    {t("detailsTab.idLabel")}
                  </p>
                  <p className="col-span-2 break-all text-sm text-muted-foreground">
                    {id}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm font-medium">
                    {t("detailsTab.nameLabel")}
                  </p>
                  <p className="col-span-2 text-sm">{name}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm font-medium">
                    {t("detailsTab.typeLabel")}
                  </p>
                  <div className="col-span-2 flex items-center">
                    {getTypeIcon()}
                    <span className="ml-2 text-sm">
                      {typeT(type as any, {}, type)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="history"
          className="mt-6 rounded-md bg-muted/10 p-4"
        >
          <LogContextsTable
            data={dataSourceData.historyLogs?.data || []}
            pagination={
              dataSourceData.historyLogs?.pagination || {
                page: 1,
                pageSize: 10,
                total: 0,
                totalPages: 0,
              }
            }
          />
        </TabsContent>

        {/* <TabsContent
          value="settings"
          className="mt-6 rounded-md bg-muted/10 p-4"
        >
          <p className="text-sm text-muted-foreground">
            {t("settingsTab.comingSoon")}
          </p>
        </TabsContent> */}
      </Tabs>

      {isRunPipelineModalOpen && (
        <RunPipelineModal
          isOpen={isRunPipelineModalOpen}
          onClose={() => setIsRunPipelineModalOpen(false)}
          dataSource={dataSourceData as any} // Cast needed if RunPipelineModal expects different props
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          dataSource={dataSourceData as any} // Cast needed if ScheduleModal expects different props
        />
      )}
    </div>
  );
}

export default DataSourceDetails;
