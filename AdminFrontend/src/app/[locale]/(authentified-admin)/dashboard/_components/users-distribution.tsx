"use client";
import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
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

export default function UserDistributionChart({ userStats }) {
  const t = useTranslations("UsersSection");

  const {
    doctors = 0,
    patients = 0,
    investigators = 0,
    admins = 0,
  } = userStats || {};

  const totalUsers = doctors + patients + investigators + admins;

  const chartData = [
    { userType: "doctors", count: doctors, fill: "hsl(var(--chart-1))" },
    { userType: "patients", count: patients, fill: "hsl(var(--chart-2))" },
    {
      userType: "investigators",
      count: investigators,
      fill: "hsl(var(--chart-3))",
    },
    { userType: "admins", count: admins, fill: "hsl(var(--chart-4))" },
  ];

  const chartConfig = {
    count: {
      label: "Count",
    },
    doctors: {
      label: t("doctors.title"),
      color: "hsl(var(--chart-1))",
    },
    patients: {
      label: t("patients.title"),

      color: "hsl(var(--chart-2))",
    },
    investigators: {
      label: t("investigators.title"),

      color: "hsl(var(--chart-3))",
    },
    admins: {
      label: t("admins.title"),

      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{t("chart.title")}</CardTitle>
        <CardDescription>{t("chart.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="userType"
              innerRadius={60}
              strokeWidth={5}
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
                          {totalUsers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Users
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
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          {/* Showing relative distribution of all user roles */}
          {t("chart.subtitle")}
        </div>
      </CardFooter>
    </Card>
  );
}
