"use client";
import { Check, ChevronsUpDown, CircleX, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import LoadingSpinner from "../shared/loading-spinner";
import { useTranslations } from "next-intl";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countries } from "@/lib/constants/countries";
import getAllCitiesByCountry from "@/actions/clinical-trials/get-all-cities-by-country";
import { Slider } from "../ui/slider";

type Props = {
  country: string;
  city: string;
  radius: number[];
  handleCountryChange: (country: string) => void;
  handleCityChange: (city: string) => void;
  handleLocationChange: (latitude: string, longitude: string) => void;
  handleSliderChange: (key: "radius") => (value: number[]) => void;
};

export function LocationFilter({
  country: countryState,
  city: cityState,
  radius,
  handleSliderChange,
  handleCountryChange,
  handleCityChange,
  handleLocationChange,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [openCountry, setOpenCountry] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const t = useTranslations("SearchPage.filtersSideBar");

  useEffect(() => {
    if (countryState) {
      const fetchCities = async () => {
        const response = await getAllCitiesByCountry(countryState);
        if ("error" in response) {
          setError(response.error);
          return;
        }
        setCities(response);
      };

      fetchCities();
    } else {
      setCities([]);
    }
  }, [countryState]);

  async function handleGetLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoading(true);
    setError(null);

    await setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (handleLocationChange) {
            handleLocationChange(latitude.toString(), longitude.toString());
            setLocation(
              `Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}`,
            );
          }
          setIsLoading(false);
        },
        (err) => {
          console.error(err);
          setError(err.message);
          setIsLoading(false);
        },
      );
    }, 1000);
  }

  function handleCancelGetLocation() {
    setIsLoading(false);
    setError(null);
    setLocation(null);
    handleLocationChange("", "");
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold text-primary" htmlFor="condition">
        {t("location.label")}
      </label>
      <div className="flex items-center gap-2">
        <Popover open={openCountry} onOpenChange={setOpenCountry}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCountry}
              className="w-full justify-between"
            >
              {countryState ? (
                <p className="w-full truncate text-start">
                  {
                    countries.find((country) => country.value === countryState)
                      ?.label
                  }
                </p>
              ) : (
                <p>{t("location.placeholder")}</p>
              )}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Select a country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.value}
                      value={country.value}
                      onSelect={(currentValue) => {
                        handleCountryChange(currentValue);
                        setOpenCountry(false);
                      }}
                    >
                      {country.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          countryState === country.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button onClick={handleGetLocation} disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : <MapPin />}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {location && (
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-primary">{location}</p>
          <Button
            variant="outline"
            className="border-0 p-0 hover:bg-transparent"
            onClick={handleCancelGetLocation}
          >
            <CircleX />
          </Button>
        </div>
      )}
      {cities.length > 0 && (
        <Popover open={openCity} onOpenChange={setOpenCity}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCity}
              className="w-full justify-between"
            >
              {cityState ? (
                <p className="w-full truncate text-start">
                  {cities.find((city) => city === cityState)}
                </p>
              ) : (
                <p>{t("location.cityPlaceholder")}</p>
              )}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Select a city..." />
              <CommandList>
                <CommandEmpty>No city found.</CommandEmpty>
                <CommandGroup>
                  {cities.map((city) => (
                    <CommandItem
                      key={city}
                      value={city}
                      onSelect={(currentValue) => {
                        handleCityChange(currentValue);
                        setOpenCity(false);
                      }}
                    >
                      {city}
                      <Check
                        className={cn(
                          "ml-auto",
                          cityState === city ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      <p className="text-sm font-semibold">
        Radius :{" "}
        <strong>
          {radius} <span className="italic">km</span>
        </strong>
      </p>
      <div className="flex items-center gap-2">
        <Button
          className="aspect-square h-6 p-0"
          onClick={() =>
            radius[0] > 0 && handleSliderChange("radius")([radius[0] - 20])
          }
        >
          -
        </Button>
        <Slider
          value={radius}
          max={5000}
          step={20}
          onValueChange={handleSliderChange("radius")}
        />
        <Button
          className="aspect-square h-6 p-0"
          onClick={() =>
            radius[0] < 5000 && handleSliderChange("radius")([radius[0] + 20])
          }
        >
          +
        </Button>
      </div>
    </div>
  );
}
