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

type PageType = { lable: string; href: string };

const pages: PageType[] = [
  { lable: "Home", href: "/" },
  { lable: "For You", href: "/for-you" },
  { lable: "Discover", href: "/discover" },
  { lable: "Playlists", href: "/playlists" },
  { lable: "Library", href: "/library" },
];

export const ResponsiveHeaderLinks: React.FC = () => {
  const pathname = usePathname();
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
            {pages.map(({ lable, href }) => (
              <Link
                key={href}
                href={href}
                className="text-lg font-medium hover:text-primary transition-colors disabled:text-secondary-foreground"
              >
                {lable}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="gap-4 hidden sm:flex">
        {pages.map(({ lable, href }) => (
          <Link
            key={href}
            href={href}
            className={`${
              pathname == href && "text-primary"
            } hover:text-primary transition-all duration-300 disabled:text-secondary-foreground`}
          >
            {lable}
          </Link>
        ))}
      </div>
    </>
  );
};
