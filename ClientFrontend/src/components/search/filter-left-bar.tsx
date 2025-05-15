"use client";

import { Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useState } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import ConditionFilter from "./condition-filter";
import StatusFilter from "./status-filter";
import GenderFilter from "./gender-filter";
import StudyTypeFilter from "./study-type-filter";
import AgeFilter from "./age-filter";
import StudyPhaseFilter from "./study-phase-filter";
import DateFilter from "./date-filter";
import { format } from "date-fns";
import { LocationFilter } from "./location-filter";
import { useTranslations } from "next-intl";

export default function FilterLeftBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations("SearchPage");

  const statusValues = searchParams.get("status")?.split(",") || [];
  const typeValues = searchParams.get("type")?.split(",") || [];
  const phaseValues = searchParams.get("phase")?.split(",") || [];

  const [filters, setFilters] = useState({
    condition: searchParams.get("condition") || "",
    status: {
      NOT_YET_RECRUITING: statusValues.includes("NOT_YET_RECRUITING"),
      RECRUITING: statusValues.includes("RECRUITING"),
      ACTIVE_NOT_RECRUITING: statusValues.includes("ACTIVE_NOT_RECRUITING"),
      COMPLETED: statusValues.includes("COMPLETED"),
      TERMINATED: statusValues.includes("TERMINATED"),
      ENROLLING_BY_INVITATION: statusValues.includes("ENROLLING_BY_INVITATION"),
      SUSPENDED: statusValues.includes("SUSPENDED"),
      WITHDRAWN: statusValues.includes("WITHDRAWN"),
      UNKNOWN: statusValues.includes("UNKNOWN"),
    },
    gender: searchParams.get("gender") || "ALL",
    type: {
      INTERVENTIONAL: typeValues.includes("INTERVENTIONAL"),
      OBSERVATIONAL: typeValues.includes("OBSERVATIONAL"),
      EXPANDED_ACCESS: typeValues.includes("EXPANDED_ACCESS"),
    },
    minAge: [
      searchParams.get("minAge") !== null
        ? parseInt(searchParams.get("minAge")!)
        : 0,
    ],
    maxAge: [
      searchParams.get("maxAge") !== null
        ? parseInt(searchParams.get("maxAge")!)
        : 0,
    ],
    phase: {
      NA: phaseValues.includes("NA"),
      PHASE1: phaseValues.includes("PHASE1"),
      PHASE2: phaseValues.includes("PHASE2"),
      PHASE3: phaseValues.includes("PHASE3"),
      PHASE4: phaseValues.includes("PHASE4"),
      EARLY_PHASE1: phaseValues.includes("EARLY_PHASE1"),
    },
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    completionDate: searchParams.get("completionDate")
      ? new Date(searchParams.get("completionDate")!)
      : undefined,
    country: searchParams.get("country") || "",
    city: searchParams.get("city") || "",
    latitude: searchParams.get("latitude") || "",
    longitude: searchParams.get("longitude") || "",
    radius: [
      searchParams.get("radius") !== null
        ? parseInt(searchParams.get("radius")!)
        : 0,
    ],
  });

  function handleConditionChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setFilters((prevFilters) => ({
      ...prevFilters,
      condition: event.target.value,
    }));
  }

  function handleCountryChange(country: string): void {
    setFilters((prevFilters) => ({
      ...prevFilters,
      country: country,
    }));
  }

  function handleCityChange(city: string): void {
    setFilters((prevFilters) => ({
      ...prevFilters,
      city: city,
    }));
  }

  function handleLocationChange(latitude: string, longitude: string): void {
    setFilters((prevFilters) => ({
      ...prevFilters,
      latitude,
      longitude,
    }));
  }

  function handleCheckboxChange(
    filterType: "status" | "type" | "phase",
    key: string,
  ): (checked: boolean) => void {
    return function (checked: boolean) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterType]: {
          ...prevFilters[filterType],
          [key]: checked,
        },
      }));
    };
  }

  function handleRadioChange(value: "ALL" | "MALE" | "FEMALE"): void {
    setFilters((prevFilters) => ({
      ...prevFilters,
      gender: value,
    }));
  }

  function handleSliderChange(
    key: "minAge" | "maxAge" | "radius",
  ): (value: number[]) => void {
    return function (value: number[]) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [key]: value,
      }));
    };
  }

  function handleDateChange(
    key: "startDate" | "completionDate",
  ): (date: Date | undefined) => void {
    return function (date: Date | undefined) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [key]: date,
      }));
    };
  }

  async function handleApplyFilters() {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (key === "minAge" || key === "maxAge" || key === "radius") {
        if (Array.isArray(value) && value.length > 0 && value[0] > 0) {
          params.set(key, value[0].toString());
        }
      } else if (key === "startDate" || key === "completionDate") {
        if (value instanceof Date) {
          params.set(key, format(value, "yyyy-MM-dd"));
        } else if (typeof value === "string" && value) {
          params.set(key, value);
        }
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Convert object keys with truthy values to a comma-separated string
        const selectedKeys = Object.entries(value)
          .filter(([, subValue]) => subValue) // Keep only truthy values
          .map(([subKey]) => subKey.toUpperCase()) // Convert to uppercase
          .join(",");

        if (selectedKeys) {
          params.set(key, selectedKeys); // Store as comma-separated values
        }
      } else if (value) {
        params.set(key, value.toString());
      }
    });

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  async function handleClearFilters() {
    setFilters({
      condition: "",
      status: {
        NOT_YET_RECRUITING: false,
        RECRUITING: false,
        ACTIVE_NOT_RECRUITING: false,
        COMPLETED: false,
        TERMINATED: false,
        ENROLLING_BY_INVITATION: false,
        SUSPENDED: false,
        WITHDRAWN: false,
        UNKNOWN: false,
      },
      gender: "ALL",
      type: {
        INTERVENTIONAL: false,
        OBSERVATIONAL: false,
        EXPANDED_ACCESS: false,
      },
      minAge: [0],
      maxAge: [0],
      phase: {
        NA: false,
        PHASE1: false,
        PHASE2: false,
        PHASE3: false,
        PHASE4: false,
        EARLY_PHASE1: false,
      },
      startDate: undefined,
      completionDate: undefined,
      country: "",
      city: "",
      latitude: "",
      longitude: "",
      radius: [0],
    });

    const params = new URLSearchParams();
    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  return (
    <div className="sticky left-0 top-16 flex h-full w-4/12 flex-col border-r max-md:static max-md:top-0 max-md:w-full">
      <div className="flex items-center justify-between px-4 py-6">
        <p className="text-xl font-bold">{t("filtersSideBar.title")}</p>
        <Filter className="text-primary" />
      </div>
      <Separator />
      <div className="custom-scrollbar flex h-[calc(100vh-216px)] flex-col gap-6 overflow-y-auto px-4 py-6">
        <ConditionFilter
          condition={filters.condition}
          handleConditionChange={handleConditionChange}
        />
        <LocationFilter
          country={filters.country}
          city={filters.city}
          radius={filters.radius}
          handleCountryChange={handleCountryChange}
          handleCityChange={handleCityChange}
          handleLocationChange={handleLocationChange}
          handleSliderChange={handleSliderChange}
        />
        <StatusFilter
          status={filters.status}
          handleCheckboxChange={handleCheckboxChange}
        />
        <GenderFilter
          gender={filters.gender}
          handleRadioChange={handleRadioChange}
        />
        <StudyTypeFilter
          type={filters.type}
          handleCheckboxChange={handleCheckboxChange}
        />
        <AgeFilter
          minAge={filters.minAge}
          maxAge={filters.maxAge}
          handleSliderChange={handleSliderChange}
        />
        <StudyPhaseFilter
          phase={filters.phase}
          handleCheckboxChange={handleCheckboxChange}
        />
        <DateFilter
          dates={{
            startDate: filters.startDate,
            completionDate: filters.completionDate,
          }}
          handleDateChange={handleDateChange}
        />
      </div>
      <div className="flex gap-4 border-t p-4">
        <Button
          onClick={handleClearFilters}
          className="w-full border-2 border-primary transition-all hover:scale-105"
          variant="outline"
        >
          {t("filtersSideBar.clearFilters")}
        </Button>
        <Button
          className="w-full transition-all hover:scale-105"
          onClick={handleApplyFilters}
        >
          {t("filtersSideBar.applyFilters")}
        </Button>
      </div>
    </div>
  );
}
