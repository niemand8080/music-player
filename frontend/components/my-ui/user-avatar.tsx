"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/components/provider/user-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { logOut } from "../provider/user-provider";
import Link from "next/link";
import { Button } from "../ui/button";
import { DorpdownModeSelector } from "../ui/mode-toggle";

export const UserAvatar = () => {
  const { user } = useUser();

  if (!user)
    return (
      <div className="flex gap-2">
        <Button variant={"outline"}>
          <Link href={"/auth/login"}>Login</Link>
        </Button>
        <Button variant={"outline"} className="md:block hidden">
          <Link href={"/auth/sign-up"}>Sign Up</Link>
        </Button>
      </div>
    );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>{user?.fallback}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-2">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href={"/settings"} className="flex gap-2 items-center">
              <Settings size={16} />
              Settings
            </Link>
          </DropdownMenuItem>
          <DorpdownModeSelector />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logOut} destructive className="gap-2 flex">
            <LogOut size={16} />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
