"use client";
import React, { useEffect } from "react";
import axios from "axios";
import { useAudio } from "@/components/provider/audio-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  const { isPlaying, setIsPlaying } = useAudio();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "/user_data",
          {},
          {
            withCredentials: true,
          }
        );
        if (response.data.success) {
          const user = response.data.user;
          const created = new Date(user.created_at);
          const since = created.toDateString();
          toast({
            title: "Welcome back!",
            description: (
              <span>
                Hello,{" "}
                <span className="font-bold text-primary">{user.username}</span>!
                You've been with us since {since}.
              </span>
            ) as React.ReactNode,
          });
        } else {
          toast({
            title: "Login for better experiens",
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
      } catch (error) {
        console.error("Error: ", error);
      }
    };
    getUser();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center gap-5">
      Home
      <Button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "True" : "False"}
      </Button>
    </div>
  );
};

export default Home;
