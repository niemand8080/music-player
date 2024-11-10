"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "./dropdown-menu";

export const ModeToggle: React.FC<{
  always?: boolean;
  asChilde?: boolean;
  show?: "sm" | "md" | "lg";
}> = ({ always, asChilde, show = "sm" }) => {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () =>
    resolvedTheme == "dark" ? setTheme("light") : setTheme("dark");

  if (asChilde)
    return (
      <>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            toggleTheme();
          }}
          className={`${show + ":hidden"} gap-2 flex no-select`}
        >
          <Sun
            className={`h-[1rem] w-[1rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-180 dark:scale-20 dark:opacity-0`}
          />
          <Moon
            className={`absolute h-[1rem] w-[1rem] rotate--rotate-180 scale-20 opacity-0 transition-all duration-1000 dark:rotate-0 dark:scale-100 dark:opacity-100`}
          />
          {resolvedTheme?.slice(0, 1).toUpperCase()}
          {resolvedTheme?.slice(1)}
        </DropdownMenuItem>
      </>
    );

  return (
    <div
      className={`${!always && "hidden"} ${show + ":block"} relative flex items-center`}
    >
      <Button
        className={`hover:bg-transparent flex items-center justify-center p-0`}
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
      >
        <Sun
          className={`absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-180 dark:scale-20 dark:opacity-0`}
        />
        <Moon
          className={`absolute h-[1.2rem] w-[1.2rem] rotate--rotate-180 scale-20 opacity-0 transition-all duration-1000 dark:rotate-0 dark:scale-100 dark:opacity-100`}
        />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
};
