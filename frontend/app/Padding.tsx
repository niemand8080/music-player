"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { getPageSetting } from "@/lib/utils";

export const Padding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  if (getPageSetting(pathname, "noPadding")) return children;
  return (
    <>
      <div className="absolute top-0 left-0 h-14 w-screen" />
      <div className="absolute top-14 left-0 w-screen h-[calc(100vh-7.5rem)]">{children}</div>
      {/* <div className="absolute bottom-0 left-0 h-16 w-screen" /> */}
    </>
  );
};