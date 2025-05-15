"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartData = [
  { status: "completed", count: 275, fill: "var(--color-completed)" },
  {
    status: "not_yet_recruiting",
    count: 200,
    fill: "var(--color-not_yet_recruiting)",
  },
  {
    status: "active_not_recruiting",
    count: 187,
    fill: "var(--color-active_not_recruiting)",
  },
  { status: "recruiting", count: 173, fill: "var(--color-recruiting)" },
  { status: "suspended", count: 90, fill: "var(--color-suspended)" },
];

const chartConfig = {
  count: {
    label: "Number of Trials",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  not_yet_recruiting: {
    label: "Not Yet Recruiting",
    color: "hsl(var(--chart-2))",
  },
  active_not_recruiting: {
    label: "Active Not Recruiting",
    color: "hsl(var(--chart-3))",
  },
  recruiting: {
    label: "Recruiting",
    color: "hsl(var(--chart-4))",
  },
  suspended: {
    label: "Suspended",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function TrialStatusDistributionPieChart() {
  const id = "pie-interactive";
  const [activeStatus, setActiveStatus] = React.useState(chartData[0].status);
  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.status === activeStatus),
    [activeStatus],
  );
  const statusList = React.useMemo(
    () => chartData.map((item) => item.status),
    [],
  );

  return (
    <Card data-chart={id} className="flex w-full flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Trial Status Distribution</CardTitle>
          {/* <CardDescription>January - June 2024</CardDescription> */}
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger
            className="ml-auto h-7 w-[190px] rounded-lg"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {statusList.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];
              if (!config) {
                return null;
              }
              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {chartData[activeIndex].count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Trials
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
