"use client";
import React from "react";
import { useAudio } from "@/components/provider/audio-provider";
import { Button } from "@/components/ui/button";

const Page = () => {
  const { isPlaying, togglePlayPause } = useAudio();
  return (
    <div className="flex h-screen items-center justify-center gap-5">
      For You
      <Button onClick={togglePlayPause}>
        {isPlaying ? "True" : "False"}
      </Button>
    </div>
  );
};

export default Page;
