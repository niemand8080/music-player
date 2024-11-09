"use client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import React from "react";
import { Activity } from "lucide-react";
import Link from "next/link";
import { ResponsiveHeaderLinks } from "@/components/my-ui/responsive-header-link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/my-ui/user";
import { Separator } from "@/components/ui/separator";
import { getPageSetting } from "@/lib/utils";

const Header: React.FC = () => {
  const pathname = usePathname();

  if (getPageSetting(pathname, 'simpleHeader'))
    return (
      <>
        <div className="fixed top-0 left-0 max-w-[100vw] w-screen h-14 flex px-5 justify-between items-center z-10 backdrop-blur-sm">
          <Link href={"/"} className="font-bold flex gap-2 items-center">
            <Activity size={16} className="text-primary" />
            <span>Music Player</span>
          </Link>
          <div className="flex sm:gap-5 gap-3 items-center">
            <ModeToggle always={true} />
          </div>
        </div>
      </>
    );

  return (
    <div className="fixed top-0 left-0 max-w-[100vw] w-screen h-14 flex justify-between px-3 sm:px-5 items-center z-10 backdrop-blur-sm">
      <Link href={"/"} className="font-bold flex gap-2 items-center">
        <Activity size={16} className="text-primary hidden sm:block" />
        <ResponsiveHeaderLinks only="sheet" />
        <span className="">Music Player</span>
      </Link>
      <div className="flex space-x-3 items-center h-6">
        <ResponsiveHeaderLinks only="urls" />
        <Separator orientation="vertical" className="sm:block hidden" />
        <ModeToggle />
        <Separator orientation="vertical" className="sm:block hidden" />
        <UserAvatar />
      </div>
    </div>
  );
};

export default Header;
