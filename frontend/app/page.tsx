"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";

const Home = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Tooltip>
        <TooltipTrigger>
          Home
        </TooltipTrigger>
        <TooltipContent>
          test
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default Home;
