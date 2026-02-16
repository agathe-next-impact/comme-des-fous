"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleClick = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <Button
      className="text-white"
      size="icon"
      onClick={handleClick}
      aria-label="Toggle theme"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${resolvedTheme === "dark" ? "scale-0 -rotate-90" : "scale-100 rotate-0"}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${resolvedTheme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"}`} />
    </Button>
  );
}
