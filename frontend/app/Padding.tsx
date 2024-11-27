"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { getPageSetting } from "@/lib/utils";
import { useDisplay } from "@/components/provider/display-provider";

export const Padding: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const { displaySongList, forceHideSongList } = useDisplay();
  if (getPageSetting(pathname, "noPadding")) return children;
  return (
    <div className="max-w-xxl w-screen mx-auto overflow-y-auto scrollbar-hidden">
      <div className="h-14 w-full" />
      <div
        className={`${
          displaySongList && !forceHideSongList ? "md:pl-[25.5rem] pr-3" : "px-3"
        } transition-all duration-300 w-full h-[calc(100vh-3.5rem)] md:pr-5`}
      >
        {children}
      </div>
    </div>
  );
};
