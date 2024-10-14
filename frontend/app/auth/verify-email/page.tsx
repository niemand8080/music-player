"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const { toast } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window == "undefined" || !inputRef.current) return;
    const email = window.localStorage.getItem("email");
    setEmail(email || "");
    if (!email) {
      toast({
        title: "You are already verified",
        description: `Redirecting...`,
      });
      window.localStorage.removeItem("email");
      // router.push("/auth/login");
    }

    document.addEventListener("keydown", () => inputRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", () => inputRef.current?.focus());
    }
  }, []);

  const verify = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/verify_email",
        {
          email: email,
          code: code,
        }
      );
      toast({
        title: response.data.message[0],
        description: response.data.message[1],
      });
      if (response.data.success) {
        window.localStorage.removeItem("email");
        router.push("/auth/login");
      } else {
        setValue("");
      }
    } catch (error) {
      console.error("Error: " + error);
      toast({
        title: "An error occured while verifing",
        description: `${error}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendNewCode = async () => {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/send_new_code",
        {
          email: email,
        }
      );
      console.log(response.data);
      if (response.data.success) {
        toast({
          title: "Sent new verification code",
          description: `to ${email}`,
        });
      } else {
        toast({
          title: "Failed to sent new verification code",
          description: `to ${email}`,
        });
      }
    } catch (error) {
      console.log("Error: " + error);
      toast({
        title: "Error sending new verification code",
        description: `to ${email}`,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <Card className="w-full sm:w-[350px] border-0 shadow-none sm:shadow-sm sm:border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>Enter your email verification code.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full justify-center">
            <InputOTP
              ref={inputRef} 
              maxLength={6}
              value={value}
              onChange={(value) => {
                setValue(value);
                if (value.length == 6) {
                  verify(value);
                }
              }}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center -translate-y-1 w-full justify-center">
            <span className="text-zinc-500">Did not recive code?</span>
            <Button variant={"link"} onClick={sendNewCode}>
              Send New Code
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default page;
