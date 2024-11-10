"use client";
import React, { useState } from "react";
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
import { LogOut, Settings, Star } from "lucide-react";
import { logOut } from "../provider/user-provider";
import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/mode-toggle";
import { Checkbox } from "../ui/checkbox";
import { SongType } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { useSongAction } from "../provider/song-action-provider";

export const UserAvatar = () => {
  const { user, authorized } = useUser();
  if (!user && authorized == false)
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
          {authorized ? (
            <Avatar>
              <AvatarImage className="rounded-full" src={(user && user.img_url) || ""} />
              <AvatarFallback>{user?.fallback}</AvatarFallback>
            </Avatar>
          ) : (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
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
          <ModeToggle asChilde show="md" />
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

export const UserStar: React.FC<{ song: SongType }> = ({ song }) => {
  const { user } = useUser();
  const { toggleFavorite } = useSongAction();

  return (
    <button
      disabled={!user}
      onClick={() => toggleFavorite(song)}
      className="font-medium text-primary w-full items-center justify-center flex"
    >
      <Star
        size={16}
        className={`${song.favorite && "fill-primary"} hover:fill-primary`}
      />
    </button>
  );
};

export const UserStarRating: React.FC<{ song: SongType }> = ({ song }) => {
  const [hover, setHover] = useState<number>(0);
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <button key={index} className="text-primary">
          <Star
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(0)}
            size={16}
            className={`${
              ((song.rating && song.rating > 0) || hover > index) &&
              "fill-primary"
            } hover:fill-primary`}
          />
        </button>
      ))}
    </div>
  );
};

export const UserInLibrary: React.FC<{ song: SongType }> = ({ song }) => {
  return <Checkbox checked={song.added_to_library || false} />;
};
