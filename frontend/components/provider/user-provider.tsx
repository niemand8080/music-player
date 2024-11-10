"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { ToastAction } from "../ui/toast";
import { usePathname, useRouter } from "next/navigation";

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
  authorized: boolean | undefined;
  logOut: () => void;
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
  const [authorized, setAuthorized] = useState<boolean>();
  const [sentWelcome, setSentWelcome] = useState<boolean>(true);

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
    if (user) setAuthorized(true);
    else setAuthorized(false);
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
        authorized,
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
      title: "Successfully logged out",
      description: "You can now change account",
    });
  } catch (error) {
    console.error("Error: " + error);
    toast({
      title: "Oops, an error occurred",
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
