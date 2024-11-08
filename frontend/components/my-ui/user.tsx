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
import { DropdownModeSelector } from "../ui/mode-toggle";
import { Checkbox } from "../ui/checkbox";
import { SongType } from "@/lib/utils";

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
          <DropdownModeSelector />
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
  const { updatedUSD, user } = useUser();
  const handleButtonClick = () => {
    updatedUSD(song.track_id, "favorite", !song.favorite);
    song.favorite = !song.favorite;
  };
  
  return (
    <button disabled={!user} onClick={handleButtonClick} className="font-medium text-primary w-full items-center justify-center flex">
      <Star
        size={16}
        className={`${song.favorite && "fill-primary"} hover:fill-primary`}
      />
    </button>
  );
};

export const UserStarRating: React.FC<{ song: SongType }> = ({
  song,
}) => {
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
              ((song.rating && song.rating > 0) || hover > index) && "fill-primary"
            } hover:fill-primary`}
          />
        </button>
      ))}
    </div>
  );
};

export const UserInLibrary: React.FC<{ song: SongType }> = ({
  song,
}) => {
  return <Checkbox checked={song.added_to_library || false} />;
};
