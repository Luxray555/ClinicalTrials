"use client";
import { Database, Globe, ClipboardList } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function DataSourceTrialsChart({ dataSourceStats }) {
  console.log("dataSourceStats", dataSourceStats);
  // Extract or use the data from props
  const {
    api = 0,
    webScraper = 0,
    investigators = 0,
    apiTrials = 0,
    webScraperTrials = 0,
    investigatorsTrials = 0,
  } = dataSourceStats || {};

  // Create a simple dataset showing sources and their trial counts
  const chartData = [
    { name: "API", trials: dataSourceStats.apiTrials },
    { name: "Web Scraper", trials: dataSourceStats.webScraperTrials },
    {
      name: "Investigators",
      trials: dataSourceStats.investigatorsTrials,
    },
  ];

  const chartConfig = {
    trials: {
      label: "Clinical Trials",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Clinical Trials by Data Source</CardTitle>
        <CardDescription>
          Number of trials collected per source type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            />
            <Bar
              dataKey="trials"
              fill="hsl(var(--chart-1))"
              radius={[0, 4, 4, 0]}
              barSize={30}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
