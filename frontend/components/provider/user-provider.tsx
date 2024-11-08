"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { ToastAction } from "../ui/toast";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/utils";

export type UserType = {
  created_at: number;
  email: string;
  username: string;
  verified: boolean;
  img_url: string;
  fallback: string;
  id: number;
};

interface UserContextType {
  user: UserType | undefined;
  triedAuth: boolean;
  logOut: () => void;
  updatedUSD: (track_id: string, change: USDType, to: string | number | boolean) => Promise<boolean>;
}

const banedWelcomePages = [
  "/auth",
  "/auth/login",
  "/auth/sign-up",
  "/auth/verify-email",
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserType>();
  const [sentWelcome, setSentWelcome] = useState<boolean>(true);
  const [triedAuth, setTriedAuth] = useState<boolean>(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "/user_data",
          {},
          { withCredentials: true }
        );
        const user = response.data.user;
        if (user) {
          const newUser = {
            created_at: user.created_at,
            email: user.email,
            username: user.username,
            verified: !!user.verified,
            img_url: user.img_url,
            fallback: getAvatarFallback(user.username),
            id: user.id,
          };
          setUser(newUser);
        } else {
          setTriedAuth(true)
        }
        if (typeof window == "undefined") return;
        const lastWelcome = Number(
          window.localStorage.getItem("sentWelcome") || 0
        );
        const last = Math.floor(
          new Date(lastWelcome).getTime() / (1000 * 60 * 60 * 24)
        );
        const today = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
        if (last < today) setSentWelcome(false);
      } catch (error) {
        console.log("Error: " + error);
        return undefined;
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) setTriedAuth(true);
  }, [user]);

  useEffect(() => {
    if (sentWelcome) return;
    setSentWelcome(true);
    window.localStorage.setItem("sentWelcome", `${new Date().getTime()}`);
    if (user) {
      const created = new Date(user.created_at);
      const since = created.toDateString();
      const ago = new Date().getTime() - created.getTime();
      toast({
        title: (
          <span>
            {ago > 172800000 ? (
              "Welcome back!"
            ) : (
              <>
                Hello,{" "}
                <span className="font-bold text-primary">{user.username}</span>!
              </>
            )}
          </span>
        ),
        description: (
          <span>
            {ago < 172800000 ? (
              <>
                You are our{" "}
                <span className="font-bold text-primary">
                  {user.id}th
                </span>{" "}
                user.
              </>
            ) : (
              <>
                Hello,{" "}
                <span className="font-bold text-primary">{user.username}</span>!
                You&apos;ve been with us since {since}.
              </>
            )}
          </span>
        ),
      });
    } else if (!banedWelcomePages.includes(pathname)) {
      toast({
        title: "Login for better experiens!",
        description: "Or sign up...",
        action: (
          <ToastAction
            altText="Login"
            onClick={() => router.push("/auth/login")}
          >
            Login
          </ToastAction>
        ),
      });
    }
  }, [pathname, router, sentWelcome, user]);

  return (
    <UserContext.Provider
      value={{
        user,
        triedAuth,
        logOut,
        updatedUSD
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

type USDType = "last_played" | "listen_time_seconds" | "favorite" | "rating" | "skip_count" | "first_played" | "added_to_library";

const updatedUSD = async (track_id: string, change: USDType, to: string | number | boolean): Promise<boolean> => {
  if (typeof to == "boolean") {
    if (to) to = 1
    else to = 0
  }
  const data = await api("/uusd", "POST", { track_id, change, to })
  if (data == false) return false;
  else return true
  // try {
  //   const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/uusd", {
  //     track_id,
  //     change,
  //     to
  //   }, {
  //     withCredentials: true
  //   });
  //   console.log(response.data);
  //   return true
  // } catch (error) {
  //   console.log("Error:", error);
  //   return false
  // }
}

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
