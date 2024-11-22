"use client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import React from "react";
import {
  Activity,
  Music2,
  Search,
  ListMusic,
  AudioLines,
  Library,
  UserPlus,
  BadgeCheck,
  Fingerprint,
  Heart,
  Settings,
  DollarSign,
  Info,
  TvMinimal,
} from "lucide-react";
import Link from "next/link";
import { ResponsiveHeaderLinks } from "@/components/my-ui/responsive-header-link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/my-ui/user";
import { Separator } from "@/components/ui/separator";
import { getPageSetting } from "@/lib/utils";

const Header: React.FC = () => {
  const pathname = usePathname();

  if (getPageSetting(pathname, "simpleHeader"))
    return (
      <>
        <div className="fixed top-0 left-0 max-w-[100vw] w-screen h-14 z-10 backdrop-blur-sm">
          <div className="max-w-xxl flex px-5 justify-between items-center h-full mx-auto">
            <Link href={"/"} className="font-bold flex gap-2 items-center">
              <HeaderIcon />
              <span>Music Player</span>
            </Link>
            <div className="flex sm:gap-5 gap-3 items-center">
              <ModeToggle always={true} />
            </div>
          </div>
        </div>
      </>
    );

  return (
    <div className="fixed top-0 left-0 max-w-[100vw] w-screen h-14 z-10 backdrop-blur-sm">
      <div className="max-w-xxl flex justify-between px-3 sm:px-5 items-center h-full mx-auto">
        <Link href={"/"} className="font-bold flex sm:gap-2 items-center">
          <HeaderIcon advanced />
          <ResponsiveHeaderLinks only="sheet" />
          <span className="">Music Player</span>
        </Link>
        <div className="flex gap-1 items-center h-6">
          <div className="mr-3">
            <ResponsiveHeaderLinks only="urls" />
          </div>
          <Separator orientation="vertical" className="md:block hidden" />
          <ModeToggle show="md" />
          <Separator orientation="vertical" className="sm:block hidden" />
          <div className="ml-3 flex items-center justify-center">
            <UserAvatar />
          </div>
        </div>
      </div>
    </div>
  );
};

const HeaderIcon: React.FC<{ advanced?: boolean }> = ({ advanced }) => {
  const pathname = usePathname();
  const className = `${
    advanced ? "text-primary" : "text-primary hidden sm:block"
  } transition-all absolute`;
  const icon = getPageSetting(pathname, "icon");
  return (
    <div className="w-5 h-5 relative items-center justify-center sm:flex hidden">
      <Music2
        size={16}
        className={`${className} ${icon != "music-2" && "opacity-0 scale-0"}`}
      />
      <Library
        size={16}
        className={`${className} ${icon != "library" && "opacity-0 scale-0"}`}
      />
      <AudioLines
        size={16}
        className={`${className} ${
          icon != "audio-lines" && "opacity-0 scale-0"
        }`}
      />
      <ListMusic
        size={16}
        className={`${className} ${
          icon != "list-music" && "opacity-0 scale-0"
        }`}
      />
      <Search
        size={16}
        className={`${className} ${icon != "search" && "opacity-0 scale-0"}`}
      />
      <Activity
        size={16}
        className={`${className} ${icon != "activity" && "opacity-0 scale-0"}`}
      />
      <UserPlus
        size={16}
        className={`${className} ${icon != "user-plus" && "opacity-0 scale-0"}`}
      />
      <BadgeCheck
        size={16}
        className={`${className} ${
          icon != "badge-check" && "opacity-0 scale-0"
        }`}
      />
      <Fingerprint
        size={16}
        className={`${className} ${
          icon != "fingerprint" && "opacity-0 scale-0"
        }`}
      />
      <Heart
        size={16}
        className={`${className} ${
          icon != "heart" && "opacity-0 scale-0"
        }`}
      />
      <Settings
        size={16}
        className={`${className} ${
          icon != "settings" && "opacity-0 scale-0"
        }`}
      />
      <DollarSign
        size={16}
        className={`${className} ${
          icon != "dollar-sign" && "opacity-0 scale-0"
        }`}
      />
      <Info
        size={16}
        className={`${className} ${
          icon != "info" && "opacity-0 scale-0"
        }`}
      />
      <TvMinimal
        size={16}
        className={`${className} ${
          icon != "tv-minimal" && "opacity-0 scale-0"
        }`}
      />
    </div>
  );
};

export default Header;
