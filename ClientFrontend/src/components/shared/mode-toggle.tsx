"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Switch } from "../ui/switch";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setChecked(storedTheme === "dark");
      setTheme(storedTheme);
    }
  }, [setTheme]);

  function handleToggle() {
    const newTheme = checked ? "light" : "dark";
    setChecked(!checked);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }

  return <Switch checked={checked} onCheckedChange={handleToggle} />;
}
