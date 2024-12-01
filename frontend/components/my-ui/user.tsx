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
import { Book, BookCheck, LogOut, Settings, Star } from "lucide-react";
import { logOut } from "../provider/user-provider";
import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/mode-toggle";
import { Checkbox } from "../ui/checkbox";
import { MediaType } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { useMediaAction } from "../provider/media-action-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
              <AvatarImage
                className="rounded-full"
                src={(user && user.img_url) || ""}
              />
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

export const UserStar: React.FC<{ media: MediaType }> = ({ media }) => {
  const { user } = useUser();
  const { toggleFavorite } = useMediaAction();

  return (
    <button
      disabled={!user}
      onClick={() => toggleFavorite(media)}
      className="font-medium text-primary w-full items-center justify-center flex p-1"
    >
      <Star
        size={16}
        className={`${media.favorite ? "fill-primary" : "fill-background"}`}
      />
    </button>
  );
};

export const UserStarRating: React.FC<{ media: MediaType }> = ({ media }) => {
  const { setRating } = useMediaAction();
  return (
    <div className="flex p-1">
      {[...Array(5)].map((_, index) => (
        <button key={index} className="text-primary">
          <Star
            onClick={() => setRating(media, index + 1)}
            size={16}
            className={`${
              (media.rating && media.rating > index) &&
              "fill-primary"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const UserAddedToLibrary: React.FC<{ media: MediaType }> = ({ media }) => {
  const { user } = useUser();
  const { toggleLibrary } = useMediaAction();

  return (
    <Tooltip>
      <TooltipTrigger
        disabled={!user}
        onClick={() => toggleLibrary(media)}
        className="font-medium text-primary w-full items-center justify-center flex relative p-1 h-6 min-w-6"
      >
        <BookCheck size={16} className={`${!media.added_to_library && "opacity-0"} transition-all absolute`} />
        <Book size={16} className={`${media.added_to_library && "opacity-0"} transition-all absolute`} />
      </TooltipTrigger>
      <TooltipContent>
        {media.added_to_library ? "Remove from Library" : "Add to Library"}
      </TooltipContent>
    </Tooltip>
  );
};

export const UserInLibrary: React.FC<{ media: MediaType }> = ({ media }) => {
  return <Checkbox checked={media.added_to_library || false} />;
};
