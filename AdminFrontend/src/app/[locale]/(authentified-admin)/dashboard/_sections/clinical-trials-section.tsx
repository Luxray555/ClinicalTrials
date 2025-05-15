"use client";
import { FileText } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslations } from "next-intl";

export const ClinicalTrialStatusEnum = {
  COMPLETED: "COMPLETED",
  // NOT_YET_RECRUITING: "NOT_YET_RECRUITING",
  UNKNOWN: "UNKNOWN",
  WITHDRAWN: "WITHDRAWN",
  TERMINATED: "TERMINATED",
  RECRUITING: "RECRUITING",
  SUSPENDED: "SUSPENDED",
} as const;

export default function ClinicalTrialsSection({ trialsData }) {
  const t = useTranslations("ClinicalTrialsSection");

  // Process data with color mappings for each status
  const processedData = (trialsData.statusDistribution || [])
    // trialsData || [
    //   { status: "COMPLETED", count: 1250 },
    //   { status: "RECRUITING", count: 1750 },
    //   // { status: "NOT_YET_RECRUITING", count: 845 },
    //   { status: "UNKNOWN", count: 320 },
    //   { status: "WITHDRAWN", count: 180 },
    //   { status: "TERMINATED", count: 240 },
    //   { status: "SUSPENDED", count: 125 },
    // ]
    .map((item) => ({
      ...item,
      fill: getStatusColor(item.status),
    }));

  // Function to get color for each status
  function getStatusColor(status) {
    switch (status) {
      case "COMPLETED":
        return "hsl(var(--chart-1))";
      case "NOT_YET_RECRUITING":
        return "hsl(var(--chart-4))";
      case "RECRUITING":
        return "hsl(var(--chart-3))";
      case "UNKNOWN":
        return "hsl(var(--chart-4))";
      case "WITHDRAWN":
        return "hsl(var(--chart-5))";
      case "TERMINATED":
        return "hsl(var(--chart-6))";
      case "SUSPENDED":
        return "hsl(var(--chart-7))";
      default:
        return "hsl(var(--chart-8))";
    }
  }

  // Calculate total trials for percentage
  // const totalTrials = processedData.reduce(
  //   (total, item) => total + item.count,
  //   0,
  // );

  const totalTrials = trialsData.total;
  // Get the current active status (for example, we'll set RECRUITING as active)
  const activeStatus = "RECRUITING";
  const activeIndex = processedData.findIndex(
    (item) => item.status === activeStatus,
  );

  // Chart configuration
  const chartConfig = {
    count: {
      label: t("count"),
    },
    COMPLETED: {
      label: t("status.completed"),
      color: "hsl(var(--chart-1))",
    },
    NOT_YET_RECRUITING: {
      label: t("status.notYetRecruiting"),
      color: "hsl(var(--chart-2))",
    },
    RECRUITING: {
      label: t("status.recruiting"),
      color: "hsl(var(--chart-3))",
    },
    UNKNOWN: {
      label: t("status.unknown"),
      color: "hsl(var(--chart-4))",
    },
    WITHDRAWN: {
      label: t("status.withdrawn"),
      color: "hsl(var(--chart-5))",
    },
    TERMINATED: {
      label: t("status.terminated"),
      color: "hsl(var(--chart-6))",
    },
    SUSPENDED: {
      label: t("status.suspended"),
      color: "hsl(var(--chart-7))",
    },
  };

  return (
    <div className="">
      <p className="mb-4 text-2xl font-semibold">{t("title")}</p>
      <div className="grid grid-cols-2 gap-6">
        {/* Summary Card for Total Clinical Trials */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r p-1 dark:from-blue-950/40 dark:to-indigo-950/40">
            <div className="flex flex-col">
              <div className="flex items-center justify-center border-border/50 p-6">
                <div className="flex flex-col items-center text-center">
                  <FileText className="mb-2 h-12 w-12 text-primary" />
                  <h2 className="text-3xl font-bold">
                    {totalTrials.toLocaleString()}
                  </h2>
                  <p className="text-muted-foreground">{t("total.title")}</p>
                </div>
              </div>

              {/* <div className="flex flex-col justify-center p-6 md:col-span-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {t("status.recruiting")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(
                        ((processedData.find((d) => d.status === "RECRUITING")
                          ?.count || 0) /
                          totalTrials) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.round(((processedData.find((d) => d.status === "RECRUITING")?.count || 0) / totalTrials) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span className="text-sm font-medium">
                      {t("status.completed")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(
                        ((processedData.find((d) => d.status === "COMPLETED")
                          ?.count || 0) /
                          totalTrials) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary/70"
                      style={{
                        width: `${Math.round(((processedData.find((d) => d.status === "COMPLETED")?.count || 0) / totalTrials) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div> */}
            </div>
          </Card>
        </div>

        {/* Chart Card */}
        <Card className="mx-auto w-full">
          <CardHeader>
            <CardTitle>{t("chart.title")}</CardTitle>
            <CardDescription>{t("chart.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={processedData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => chartConfig[value]?.label || value}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatValue={(value) => {
                        const percentage = Math.round(
                          (value / totalTrials) * 100,
                        );
                        return `${value.toLocaleString()} (${percentage}%)`;
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  strokeWidth={2}
                  radius={8}
                  activeIndex={activeIndex}
                  fill={(data) => data.fill}
                  activeBar={({ ...props }) => {
                    return (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke={props.payload.fill}
                        strokeDasharray={4}
                        strokeDashoffset={4}
                      />
                    );
                  }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              {t("chart.description")}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
