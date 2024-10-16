"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useUser } from "../provider/user-provider";

type PageType = { lable: string; href: string; locked?: boolean };

const pages: PageType[] = [
  { lable: "Home", href: "/" },
  { lable: "For You", href: "/for-you", locked: true },
  { lable: "Discover", href: "/discover" },
  { lable: "Playlists", href: "/playlists", locked: true },
  { lable: "Library", href: "/library", locked: true },
];

export const ResponsiveHeaderLinks: React.FC = () => {
  const pathname = usePathname();
  const { user } = useUser();
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-4">
            {pages.map(({ lable, href, locked }) => (
              <Link
                key={href}
                href={href}
                aria-disabled={locked}
                className="text-lg font-medium hover:text-primary transition-colors disabled:text-zinc-400"
              >
                {lable}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="gap-4 hidden sm:flex">
        {pages.map(({ lable, href, locked }) => (
          <Link
            key={href}
            href={href}
            aria-disabled={locked}
            className={`${
              pathname == href && "text-primary"
            } hover:text-primary transition-all duration-300 disabled:text-zinc-400`}
          >
            {lable}
          </Link>
        ))}
      </div>
    </>
  );
};
