"use client";
import React, { useEffect, useState } from "react";
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

const Page: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
            <Input id="username" type="username" placeholder="Username" />
          </div>
          <div className="grid gap-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type={showPassword ? "text" : "password"} />
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
            <Button className="w-full">Sign In</Button>
            <div className="flex justify-center items-center text-zinc-500">
              Don't have an account? 
              <Button variant={"link"}>
                <Link href={'/auth/sign-up'}>
                  Sing Up
                </Link>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
