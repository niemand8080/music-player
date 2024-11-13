"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { getPageSetting } from "@/lib/utils";

export const Padding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  if (getPageSetting(pathname, "noPadding")) return children;
  return (
    <div className="max-w-xxl w-screen mx-auto">
      <div className="h-14 w-full" />
      <div className="w-full h-[calc(100vh-3.5rem)]">{children}</div>
      {/* <div className="absolute bottom-0 left-0 h-16 w-screen" /> */}
    </div>
  );
};