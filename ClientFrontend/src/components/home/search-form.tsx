"use client";

import { z } from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import FormError from "../auth/form-error";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, MapPin, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import LoadingSpinner from "../shared/loading-spinner";
import { useRouter } from "@/i18n/routing";
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
import { countries } from "@/lib/constants/countries";

const formSchema = z.object({
  condition: z.string(),
  location: z.string(),
});

export default function SearchForm({ className }: { className?: string }) {
  const t = useTranslations("HomePage.SearchSection.form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condition: "",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");
    const params = new URLSearchParams();
    try {
      if (values.condition && values.location) {
        params.set("condition", values.condition);
        params.set("country", values.location);
      } else if (values.condition) {
        params.set("condition", values.condition);
      } else if (values.location) {
        params.set("country", values.location);
      } else {
        router.push("/search");
      }
      router.replace(`/search?${params.toString()}`, {
        scroll: false,
      });
    } catch (error) {
      console.log("Error", error);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("m-4 w-full max-md:w-4/5", className)}>
      <Card className="px-6 py-8 max-md:px-2 max-md:py-4">
        <CardHeader>
          <CardTitle className="text-3xl text-primary">
            <motion.p
              className="overflow-hidden whitespace-nowrap"
              initial={{
                width: 0,
              }}
              animate={{
                width: "100%",
              }}
              transition={{
                duration: 5,
                ease: "easeOut",
                repeat: Infinity,
              }}
            >
              {t("formHeader")}
            </motion.p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-center justify-between gap-6 max-md:flex-col"
            >
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("condition")}</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Search className="text-primary" />
                        <Input
                          type="text"
                          placeholder={t("conditionPlaceHolder")}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("location")}</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-primary" />
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between"
                            >
                              {field.value ? (
                                <p className="w-full truncate text-start">
                                  {
                                    countries.find(
                                      (country) =>
                                        country.value === field.value,
                                    )?.label
                                  }
                                </p>
                              ) : (
                                <p>{t("locationPlaceHolder")}</p>
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
                                      onSelect={() => {
                                        form.setValue(
                                          "location",
                                          country.value,
                                        );
                                        setOpen(false);
                                      }}
                                    >
                                      {country.label}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          field.value === country.value
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
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <Button
                disabled={isLoading}
                type="submit"
                className="w-6/12 self-end px-8 transition-all hover:scale-105"
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="text-background" />
                    <p>{t("search")}</p>
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
