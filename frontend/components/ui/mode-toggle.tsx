"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export const ModeToggle: React.FC<{ always?: boolean, asChilde?: boolean }> = ({ always, asChilde }) => {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <div className={`${!always && !asChilde && "hidden"} sm:block relative flex items-center`}>
      <Button className="hover:bg-transparent flex items-center justify-center p-0" variant="ghost" size="icon" onClick={() => resolvedTheme == "dark" ? setTheme("light") : setTheme("dark")}>
        <Sun className={`absolute h-[${!asChilde ? "1.2" : "1"}rem] w-[${!asChilde ? "1.2" : "1"}rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-180 dark:scale-20 dark:opacity-0`} />
        <Moon className={`absolute h-[${!asChilde ? "1.2" : "1"}rem] w-[${!asChilde ? "1.2" : "1"}rem] rotate--rotate-180 scale-20 opacity-0 transition-all duration-1000 dark:rotate-0 dark:scale-100 dark:opacity-100`} />
        <span className="sr-only">Toggle theme</span>
        <span className="ml-14">{asChilde && resolvedTheme}</span>
      </Button>
    </div>
  );
}
