"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonLoader } from "@/components/my-ui/loader";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { findLogin } from "@/lib/my_utils";
import { logOut } from "@/lib/utils";

const Page: React.FC = () => {
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  
  const [emailError, setEmailError] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState<
    "Taken" | "Not Vailid"
  >("Taken");
  const [usernameErrorMessage, setUsernameErrorMessage] = useState<
    "Taken" | "Special Char"
  >("Taken");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alreadyLogedIn, setAlreadyLogedIn] = useState<boolean>(false);

  const isTaken = async (value: string): Promise<boolean> => {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/taken",
        { value: value }
      );
      return response.data.exists;
    } catch (error) {
      console.error("Error: ", error);
      return false;
    }
  };

  const register_user = async (
    email: string,
    username: string,
    password: string
  ) => {
    if (typeof window == "undefined") return;
    setIsLoading(true);

    if (alreadyLogedIn) logOut();

    try {  
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/register_user",
        {
          email: email,
          username: username,
          password: password,
        }
      );
      toast({
        title: response.data.message[0],
        description: response.data.message[1],
      })
      if (response.data.success) {
        window.localStorage.setItem("email", email);
        router.push('/auth/verify-email');
      }
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const found = async () => setAlreadyLogedIn(await findLogin());
    found();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key == "Enter") handleButtonPress();
    }

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    }
  }, []);

  const handleButtonPress = () => {
    const emailElement = emailRef.current;
    const usernameElement = usernameRef.current;
    const passwordElement = passwordRef.current;
    if (!emailElement || !usernameElement || !passwordElement)
      return;

    if (emailElement.value.length < 5) {
      emailElement.select();
    } else if (usernameElement.value.length < 5) {
      usernameElement.select();
    } else if (passwordElement.value.length < 3) {
      passwordElement.select();
    } else {
      register_user(
        emailElement.value,
        usernameElement.value,
        passwordElement.value
      );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <Card className="w-full sm:w-[350px] border-0 sm:border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter a email and password to sign up
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 relative">
            <Label htmlFor="email">Email</Label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              disabled={isLoading}
              placeholder="m@example.com"
              error={emailError}
              onChange={async () => {
                const value = emailRef.current?.value || "";
                if (value.length < 5) {
                  setEmailError(false);
                  return;
                }
                const vailid = !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);

                setEmailErrorMessage("Not Vailid");
                setEmailError(vailid);
                
                if (!vailid) {
                  const taken = await isTaken(value);
                  const msg = taken ? "Taken" : "Not Vailid";
  
                  setEmailErrorMessage(msg);
                  setEmailError(vailid || taken);
                }
              }}
            />
            <div
              className={`${
                emailError ? "" : "opacity-0"
              } absolute right-2 top-8 text-xs text-error tranistion-all font-bold pointer-events-none`}
            >
              {emailErrorMessage}
            </div>
          </div>
          <div className="grid gap-2 relative">
            <Label htmlFor="username">Username</Label>
            <Input
              ref={usernameRef}
              id="username"
              type="username"
              disabled={isLoading}
              placeholder="Username"
              error={usernameError}
              onChange={async () => {
                const value = usernameRef.current?.value || "";
                const vailid = /[^a-zA-Z0-9_-]/.test(value);

                setUsernameErrorMessage("Special Char");
                setUsernameError(vailid);

                const taken = await isTaken(value);
                const msg = taken ? "Taken" : "Special Char";

                setUsernameErrorMessage(msg);
                setUsernameError(vailid || taken);
              }}
            />
            <div
              className={`${
                usernameError ? "" : "opacity-0"
              } absolute right-2 top-8 text-xs text-error tranistion-all font-bold pointer-events-none`}
            >
              {usernameErrorMessage}
            </div>
          </div>
          <div className="grid gap-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              ref={passwordRef}
              disabled={isLoading}
              type="password"
              onChange={() => {
                const length = (passwordRef.current?.value || "").length;
                if (length < 3 && length > 0) {
                  setPasswordError(true);
                } else {
                  setPasswordError(false);
                }
              }}
            />
            <div
              className={`${
                passwordError ? "" : "opacity-0"
              } absolute right-2 top-8 text-xs text-error tranistion-all font-bold pointer-events-none`}
            >
              To Short
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full gap-2">
            <Button
              className="w-full"
              disabled={emailError || usernameError}
              onClick={() => handleButtonPress()}
            >
              <ButtonLoader loading={isLoading}>Sign Up</ButtonLoader>
            </Button>
            <div className="flex justify-center items-center text-zinc-500">
              Already have an account?
              <Button variant={"link"}>
                <Link href={"/auth/login"}>Login</Link>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;