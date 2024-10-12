"use client"
import React from "react"
import { useAudio } from "@/components/provider/AudioProvider"
import { Button } from "@/components/ui/button"

const Home = () => {
  const { isPlaying, setIsPlaying } = useAudio();
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
