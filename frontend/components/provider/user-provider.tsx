"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

export type UserType = {
  created_at: number;
  email: string;
  username: string;
  verified: boolean;
  img_url: string;
  fallback: string;
};

interface UserContextType {
  user: UserType | undefined;
  logOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType>();

  useEffect(() => {
    const getUser = async () => {
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
          fallback: getAvatarFallback(user.username),
        };
        setUser(newUser);
      } catch (error) {
        console.log("Error: " + error);
        return undefined;
      }
    };
    getUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        logOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const getAvatarFallback = (username: string): string => {
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

export const useUser = () => {
  const context = useContext(UserContext);
  if (context == undefined) {
    throw new Error("useUser can only be used within a UserProvider");
  }
  return context;
};
