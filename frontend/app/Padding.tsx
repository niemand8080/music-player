"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { getPageSetting } from "@/lib/utils";

export const Padding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  if (getPageSetting(pathname, "noPadding")) return children;
  return (
    <>
      <div className="h-14 w-screen" />
      <div className="h-[calc(100vh-112px)]">{children}</div>
      <div className="h-14 w-screen" />
    </>
  );
};