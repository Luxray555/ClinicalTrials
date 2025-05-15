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
import { NumberOfTrialsForEachSourceResponse } from "@/actions/clinical-trials/get-number-of-trials-for-each-source";

export default function NumberOfTrialsEachSourcePieChart({
  numberOfTrialsForEachSource,
}: {
  numberOfTrialsForEachSource:
    | NumberOfTrialsForEachSourceResponse[]
    | {
        error: string;
      };
}) {
  const [activeSource, setActiveSource] = React.useState("");
  const [chartData, setChartData] = React.useState<
    Array<{
      source: string;
      count: number;
      fill: string;
    }>
  >([]);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({
    count: { label: "Number of Trials" },
  });

  React.useEffect(() => {
    if ("error" in numberOfTrialsForEachSource) return;

    const newChartData = numberOfTrialsForEachSource.map((item) => ({
      source: item.source,
      count: item.count,
      fill: `var(--color-${item.source})`,
    }));

    const newChartConfig = {
      count: { label: "Number of Trials" },
      ...Object.fromEntries(
        numberOfTrialsForEachSource.map((item, index) => [
          item.source,
          {
            label: item.source,
            color: `hsl(var(--chart-${index + 1}))`,
          },
        ]),
      ),
    } satisfies ChartConfig;

    setChartData(newChartData);
    setChartConfig(newChartConfig);
    if (newChartData.length > 0 && !activeSource) {
      setActiveSource(newChartData[0].source);
    }
  }, []);

  const id = "pie-interactive";
  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.source === activeSource),
    [activeSource, chartData],
  );
  const statusList = React.useMemo(
    () => chartData.map((item) => item.source),
    [chartData],
  );

  if ("error" in numberOfTrialsForEachSource) {
    return null;
  }

  if (chartData.length === 0) {
    return null;
  }

  console.log(chartData);
  console.log(chartConfig);
  return (
    <Card data-chart={id} className="flex w-full flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Trials across sources</CardTitle>
        </div>
        <Select value={activeSource} onValueChange={setActiveSource}>
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
                          {chartData[activeIndex]?.count.toLocaleString()}
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
