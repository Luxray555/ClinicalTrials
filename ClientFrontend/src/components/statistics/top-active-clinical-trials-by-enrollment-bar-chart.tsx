"use client";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
const chartData = [
  { trial: "Trial A", participants: 450 },
  { trial: "Trial B", participants: 320 },
  { trial: "Trial C", participants: 510 },
  { trial: "Trial D", participants: 280 },
  { trial: "Trial E", participants: 390 },
  { trial: "Trial F", participants: 470 },
];
const chartConfig = {
  participants: {
    label: "Participants",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function TopActiveClinicalTrialsByEnrollmentBarChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Active Clinical Trials</CardTitle>
        <CardDescription>Showing participant enrollment</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 80,
              left: 80,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="trial"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="participants"
              fill="var(--color-participants)"
              radius={8}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {/* <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div> */}
        <div className="leading-none text-muted-foreground">
          Showing participant data for top clinical trials
        </div>
      </CardFooter>
    </Card>
  );
}
