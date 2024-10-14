import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { Verified } from "lucide-react";
import { userAgent } from "next/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAvatarFallback = (username: string): string => {
  const split = username.split(" ");
  if (split.length > 1)
    return (
      split[0].slice(0, 1).toUpperCase() + split[1].slice(0, 1).toUpperCase()
    );
  return username.slice(0, 1).toUpperCase();
};

export const logOut = async () => {
  try {
    await axios.post(
      process.env.NEXT_PUBLIC_API_URL + "/logout",
      {},
      {
        withCredentials: true,
      }
    );

    toast({
      title: "Successfully loged out",
      description: "You can now change account",
    });
  } catch (error) {
    console.error("Error: " + error);
    toast({
      title: "Oops, an error occured",
      description: "Try again later...",
    });
  }
};

export type UserType = {
  created_at: number;
  email: string;
  username: string;
  verified: boolean;
  img_url: string;
};

export const getUser = async (): Promise<UserType | undefined> => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_URL + "/user_data",
      {},
      { withCredentials: true }
    );
    const user = response.data.user;
    const newUser = {
      created_at: user.created_at,
      email: user.email,
      username: user.username,
      verified: !!user.verified,
      img_url: user.img_url,
    };
    return newUser;
  } catch (error) {
    console.log("Error: " + error);
    return undefined;
  }
};
