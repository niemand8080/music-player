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
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ButtonLoader } from "@/components/my-ui/loader";
import { useToast } from "@/hooks/use-toast";
import { findLogin } from "@/lib/my_utils";
import { logOut } from "@/components/provider/user-provider";

const Page: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const [isLodaing, setIsloading] = useState<boolean>(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const found = async () => setAlreadyLoggedIn(await findLogin());
    found();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key == "Enter") handleButtonPress();
    };

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonPress = () => {
    const usernameElement = usernameRef.current;
    const passwordElement = passwordRef.current;
    if (!usernameElement || !passwordElement) return;

    if (usernameElement.value == "") usernameElement.select();
    else if (passwordElement.value == "") passwordElement.select();
    else login();
  };

  const login = async () => {
    const usernameElement = usernameRef.current;
    const passwordElement = passwordRef.current;

    if (!usernameElement || !passwordElement) return;
    setIsloading(true);

    const username = usernameElement.value;
    const password = passwordElement.value;

    if (alreadyLoggedIn) logOut();

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/login",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast({
          title: "Successfully loged in",
          description: `Redirecting...`,
        });
        router.push("/");
      } else {
        toast({
          variant: "destructive",
          title: "Wrong login data",
          description: `Please try again`,
        });
        passwordElement.focus();
        setTimeout(() => passwordElement.select(), 200);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: "An error occurred",
          description: error.response.data.message || "Login failed",
          variant: "destructive",
        });
      } else {
        toast({
          title: "An error occurred",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <Card className="w-full sm:w-[350px] border-0 shadow-none sm:shadow-sm sm:border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username and password to login
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              ref={usernameRef}
              id="username"
              type="username"
              disabled={isLodaing}
              placeholder="Username"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              ref={passwordRef}
              id="password"
              disabled={isLodaing}
              type={"password"}
              placeholder="·····"
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full gap-2">
            <Button
              className="w-full"
              disabled={isLodaing}
              onClick={() => handleButtonPress()}
            >
              <ButtonLoader loading={isLodaing}>Sign In</ButtonLoader>
            </Button>
            <div className="flex justify-center items-center text-zinc-500">
              Don&apos;t have an account?
              <Button variant={"link"}>
                <Link href={"/auth/sign-up"}>Sign Up</Link>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
