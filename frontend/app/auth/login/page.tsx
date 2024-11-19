"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSeparator, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import Link from "next/link";
import axios from "axios";
import { ButtonLoader } from "@/components/my-ui/loader";
import { useToast } from "@/hooks/use-toast";
import { findLogin } from "@/lib/my_utils";
import { logOut } from "@/components/provider/user-provider";
import { useAlert } from "@/components/provider/alert-provider";
import { api } from "@/lib/utils";

const Page: React.FC = () => {
  const { toast } = useToast();

  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState<boolean>(false);

  const { newAlert } = useAlert();
  const [rightCode, setRightCode] = useState<boolean>(false);
  const [dialogOpened, setDialogOpened] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const sendCode = async () => {
    const response = await api('/send_reset_password_code', 'POST');
    if (response.success) {
      newAlert('success', 'Send E-Mail');
    } else {
      newAlert('error', 'Error Sending E-Mail');
    }
  }

  const setPassword = useCallback(async () => {
    const newPassword = newPasswordRef.current;
    if (!newPassword) return;

    if (newPassword.value == "") {
      newPassword.focus();
    } else {
      const response = await api('/change_password', 'POST', {
        newPassword: newPassword.value,
        code,
      });
  
      if (response.success) newAlert('success', 'Changed Password');
      else newAlert('error', 'Something went Wrong');

      setDialogOpened(false);
    }
  }, [newAlert, code]);

  const verifyCode = async (code: string) => {
    const response = await api('/verify_reset_password_code', 'POST', {
      code
    });
    if (!response.success) {
      newAlert('error', 'Wrong Code');
      setCode("");
    } else {
      setRightCode(true);
    }
  };

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
    setIsLoading(true);

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
          title: "Successfully logged in",
          description: `Redirecting...`,
        });
        window.location.pathname = "/";
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
      setIsLoading(false);
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
              disabled={isLoading}
              placeholder="Username"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="flex justify-between items-center">
              Password
              <Dialog open={dialogOpened} onOpenChange={setDialogOpened}>
                <DialogTrigger asChild>
                  <Button type="button" variant={"link"} className="h-4 p-0">
                    Forgot Password?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Forgot Password?</DialogTitle>
                    <DialogDescription className="flex flex-col">
                      Follow these steps to reset your password:
                      <span className="ml-1">
                        1. Enter your email address and click &quot;Send Code&quot;
                        <br />2. Check your inbox for the password reset code
                        <br />3. Enter the code and create your new password
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                  <CodeOTP
                    ref={codeRef}
                    code={code}
                    setCode={setCode}
                    verifyCode={verifyCode}
                    disabled={rightCode}
                  />
                  <div className={`w-96 mx-auto`}>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword"
                      ref={newPasswordRef}
                      type="password"
                      placeholder="New Password.."
                      className={`w-96`}
                      disabled={!rightCode}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant={"outline"}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button onClick={rightCode ? setPassword : sendCode}>
                      {rightCode ? "Set Password" : "Send Code"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Label>
            <Input
              ref={passwordRef}
              id="password"
              disabled={isLoading}
              type={"password"}
              placeholder="·····"
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full gap-2">
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={() => handleButtonPress()}
            >
              <ButtonLoader loading={isLoading}>Login</ButtonLoader>
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


const CodeOTP: React.FC<{ 
  ref: React.RefObject<HTMLInputElement>,
  code: string, 
  setCode: (code: string) => void,
  verifyCode: (code: string) => void,
  disabled: boolean,
}> = ({ ref, code, setCode, verifyCode, disabled }) => {
  return (
    <div className={`mx-auto`}>
      <Label htmlFor="inputOTP" className={`${disabled && "text-secondary-foreground"}`}>Password Reset Code</Label>
      <InputOTP
        id="inputOTP"
        ref={ref} 
        maxLength={8}
        value={code}
        onChange={(code) => {
          setCode(code);
          if (code.length == 8) {
            verifyCode(code);
          }
        }}
        disabled={disabled}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
          <InputOTPSlot index={6} />
          <InputOTPSlot index={7} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}

export default Page;
