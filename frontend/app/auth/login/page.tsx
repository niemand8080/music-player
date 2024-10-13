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
import { useRouter } from "next/navigation";
import { ButtonLoader } from "@/components/my-ui/loader";
import { useToast } from "@/hooks/use-toast";

const Page: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLodaing, setIsloading] = useState<boolean>(false);

  const login = async () => {
    const usernameElement = usernameRef.current;
    const passwordElement = passwordRef.current;

    if (!usernameElement || !passwordElement) return;
    setIsloading(true);

    const username = usernameElement.value;
    const password = passwordElement.value;

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/login",
        {
          username,
          password,
        },
        {
          withCredentials: true, // This is important for cookies
          httpsAgent: new (
            await import("https")
          ).Agent({
            rejectUnauthorized: process.env.NODE_ENV === "production",
          }),
        }
      );
      console.log(response.data);
      if (response.data.success) {
        toast({
          title: "Successfully loged in",
          description: `Redirecting...`,
        });
        // router.push('/');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: "An error occurred",
          description: error.response.data.message || "Login failed",
          variant: "destructive"
        });
      } else {
        toast({
          title: "An error occurred",
          description: "Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <Card className="w-[350px]">
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
            <div className="grid gap-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                ref={passwordRef}
                id="password"
                disabled={isLodaing}
                type={showPassword ? "text" : "password"}
              />
              <button
                onClick={() => setShowPassword((v) => !v)}
                className={`${
                  showPassword ? "" : "opacity-0"
                } absolute right-2 top-[30px] hover:text-zinc-50 text-zinc-400 tranistion-all`}
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => setShowPassword((v) => !v)}
                className={`${
                  showPassword ? "opacity-0" : ""
                } absolute right-2 top-[30px] hover:text-zinc-50 text-zinc-400 tranistion-all`}
              >
                <EyeOff size={18} />
              </button>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col w-full gap-2">
              <Button className="w-full" disabled={isLodaing} onClick={() => login()}>
                <ButtonLoader loading={isLodaing}>Sign In</ButtonLoader>
              </Button>
              <div className="flex justify-center items-center text-zinc-500">
                Don't have an account?
                <Button variant={"link"}>
                  <Link href={"/auth/sign-up"}>Sing Up</Link>
                </Button>
              </div>
            </div>
          </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
