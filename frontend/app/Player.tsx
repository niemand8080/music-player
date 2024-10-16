"use client";
import React, { useState } from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "@/components/provider/audio-provider";

export const Player = () => {
  return (
    <div className="w-screen fixed bottom-0 left-0 border-t h-14 py-2 flex px-5 justify-between items-center z-10 backdrop-blur-sm">
      <div></div>
      <PlayButtons />
      <div></div>
    </div>
  );
};

export const PlayButtons = () => {
  const { isPlaying, togglePlayPause } = useAudio();
  const [countRight, setCountRight] = useState<number>(0);
  const [countLeft, setCountLeft] = useState<number>(0);
  const [last, setLast] = useState<number>(0);
  return (
    <div className="flex gap-10">
      <button onClick={() => {
        const now = new Date().getTime();
        if (now < last + 400) return;
        setLast(now);
        setCountLeft((prev) => prev + 1)
        setTimeout(() => setCountLeft((prev) => prev + 1), 100);
      }} className="group relative flex items-center hover:text-primary transition-all duration-300 rotate-180">
        <Play
          size={20}
          className={`${countLeft % 2 == 0 ? "translate-x-3 opacity-0 scale-0 duration-300" : "duration-0"} fill-current absolute transition-all`}
        />
        <Play
          size={20}
          className={`${countLeft % 2 == 0 ? "translate-x-5 opacity-0 scale-0 duration-300" : "duration-0 translate-x-3"} fill-current absolute transition-all`}
        />
        <Play
          size={20}
          className={`${countLeft % 2 == 1 ? "-translate-x-2 opacity-0 scale-0 duration-0" : "opacity-100 translate-x-0 scale-100 duration-300"} fill-current absolute transition-all`}
        />
        <Play
          size={20}
          className={`${countLeft % 2 == 1 ? "-translate-x-5 opacity-0 scale-0" : "opacity-100 translate-x-3 scale-100 duration-300"} fill-current absolute transition-all`}
        />
      </button>
      
      <button
        onClick={togglePlayPause}
        className="relative flex items-center justify-center hover:text-primary"
      >
        <Play
          size={28}
          className={`${
            isPlaying && "opacity-0 scale-0"
          } absolute fill-current transition-all duration-300`}
        />
        <Pause
          size={28}
          className={`${
            !isPlaying && "opacity-0 scale-0"
          } absolute fill-current transition-all duration-300`}
        />
      </button>
      
      <button onClick={() => {
        const now = new Date().getTime();
        if (now < last + 400) return;
        setLast(now);
        setCountRight((prev) => prev + 1)
        setTimeout(() => setCountRight((prev) => prev + 1), 100);
      }} className="group relative flex items-center hover:text-primary transition-all duration-300">
        <Play
          size={20}
          className={`${countRight % 2 == 0 ? "translate-x-3 opacity-0 scale-0 duration-300" : "duration-0"} fill-current absolute transition-all`}
        />
        <Play
          size={20}
          className={`${countRight % 2 == 0 ? "translate-x-5 opacity-0 scale-0 duration-300" : "duration-0 translate-x-3"} fill-current absolute transition-all`}
        />
        <Play
          size={20}
          className={`${countRight % 2 == 1 ? "-translate-x-2 opacity-0 scale-0 duration-0" : "opacity-100 translate-x-0 scale-100 duration-300"} fill-current absolute transition-all`}
        />
        <Play
          size={20}
          className={`${countRight % 2 == 1 ? "-translate-x-5 opacity-0 scale-0" : "opacity-100 translate-x-3 scale-100 duration-300"} fill-current absolute transition-all`}
        />
      </button>
    </div>
  );
};
