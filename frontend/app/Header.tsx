"use client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import React from "react";
import { Activity } from "lucide-react";
import Link from "next/link";
import { ResponsiveHeaderLinks } from "@/components/my-ui/responsive-header-link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/my-ui/user-avatar";
import { Separator } from "@/components/ui/separator";

const simpleHeader: string[] = [
  "/auth",
  "/auth/login",
  "/auth/sign-up",
  "/auth/verify-email",
];

const Header: React.FC = () => {
  const pathname = usePathname();
  if (simpleHeader.includes(pathname))
    return (
      <div className="fixed top-0 left-0 w-screen bg-gradient-to-b from-zinc-50 via-zinc-50 dark:from-zinc-950 dark:via-zinc-950/20 to-transparent h-14 flex px-5 justify-between items-center z-10 backdrop-blur-sm">
        <Link href={"/"} className="font-bold flex gap-2 items-center">
          <Activity size={16} className="text-primary" />
          <span>Musicplayer</span>
        </Link>
        <div className="flex sm:gap-5 gap-3 items-center">
          <ModeToggle allways={true} />
        </div>
      </div>
    );

  return (
    <div className="fixed top-0 left-0 w-screen bg-gradient-to-b from-zinc-50 via-zinc-50 dark:from-zinc-950 dark:via-zinc-950/20 to-transparent h-14 border-b flex justify-between px-3 sm:px-5 items-center z-10 backdrop-blur-sm">
      <Link href={"/"} className="font-bold flex gap-2 items-center">
        <Activity size={16} className="text-primary" />
        <span className="">Musicplayer</span>
      </Link>
      <div className="flex space-x-3 items-center h-6">
        <ResponsiveHeaderLinks />
        <Separator orientation="vertical" className="sm:block hidden" />
        <ModeToggle />
        <Separator orientation="vertical" />
        <UserAvatar />
      </div>
    </div>
  );
};

export default Header;
