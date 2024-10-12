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
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import axios from "axios";

const Page: React.FC = () => {
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

  const isTaken = async (value: string): Promise<boolean> => {
    console.log(value);
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/taken",
        { value: value }
      );
      return response.data.exists;
    } catch (error) {
      console.log("Error: ", error);
      return false;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <Card className="w-[350px]">
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

                const taken = await isTaken(value);
                const msg = taken ? "Taken" : "Not Vailid";

                setEmailErrorMessage(msg);
                setEmailError(vailid || taken);
              }}
            />
            <div
              className={`${
                emailError ? "" : "opacity-0"
              } absolute right-2 top-8 text-xs text-error tranistion-all font-bold`}
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
              } absolute right-2 top-8 text-xs text-error tranistion-all font-bold`}
            >
              {usernameErrorMessage}
            </div>
          </div>
          <div className="grid gap-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input id="password" ref={passwordRef} type="password" />
            <div
              className={`${
                passwordError ? "" : "opacity-0"
              } absolute right-2 top-8 text-xs text-error tranistion-all font-bold`}
              onChange={() => {
                setPasswordError(true) // Password...
              }}  
            >
              To Short
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full gap-2">
            <Button
              className="w-full"
              disabled={
                emailError ||
                usernameError ||
                (emailRef.current?.value || "").length < 5 ||
                (usernameRef.current?.value || "").length < 5 || 
                (passwordRef.current?.value || "").length < 8
              }
            >
              Sign Up
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
