import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const logOut = async () => {
  try {
    const response = await axios.post(
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
