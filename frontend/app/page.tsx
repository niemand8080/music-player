"use client";
import React from "react";
import { useAudio } from "@/components/provider/audio-provider";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { BlurImg } from "@/components/my-ui/blur-img";

const Home = () => {
  const { isPlaying, togglePlayPause } = useAudio();

  return (
    <div className="flex h-screen items-center justify-center gap-5">
      {/* Home
      <Button onClick={togglePlayPause}>
        {isPlaying ? "True" : "False"}
      </Button> */}
      <BlurImg
        src="https://niemand8080.de/db/images/Super%20Mario%20World%20Game%20Over%20LoFi%20Hip%20Hop%20Remix.png"
        alt="Song Cover"
        size={200}
      />
    </div>
  );
};

export default Home;
