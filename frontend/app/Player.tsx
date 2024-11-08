"use client";
import React, { useState } from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "@/components/provider/audio-provider";
import { usePathname } from "next/navigation";
import { getPageSetting } from "@/lib/utils";

export const Player = () => {
  const pathname = usePathname();
  if (getPageSetting(pathname, 'playerHidden')) return null;
  return (
    <>
      <div className="max-w-[100vw] w-screen fixed bottom-0 left-0 border-t h-16 py-2 flex px-5 justify-between items-center z-10 backdrop-blur-sm">
        <div></div>
        <PlayButtons />
        <div></div>
      </div>
    </>
  );
};

export const PlayButtons: React.FC = () => {
  const { isPlaying, togglePlayPause, playNext, playLast, nextSongs, songHistory, playInfinity } = useAudio();
  const [countRight, setCountRight] = useState<number>(0);
  const [countLeft, setCountLeft] = useState<number>(0);
  const [last, setLast] = useState<number>(0);
  return (
    <div className="flex gap-10">
      {/* Play Last */}
      <button
        disabled={songHistory.length == 0}
        onClick={() => {
          playLast();
          const now = new Date().getTime();
          if (now < last + 400) return;
          setLast(now);
          setCountLeft((prev) => prev + 1);
          setTimeout(() => setCountLeft((prev) => prev + 1), 100);
        }}
        className="group relative flex items-center hover:text-primary rotate-180 disabled:text-secondary"
      >
        <Play
          size={20}
          style={{ transition: "colors 0.15" }}
          className={`${
            countLeft % 2 == 0
              ? "translate-x-3 opacity-0 scale-0 duration-300"
              : "duration-0"
          } fill-current absolute transition-all`}
        />
        <Play
          size={20}
          style={{ transition: "colors 0.15" }}
          className={`${
            countLeft % 2 == 0
              ? "translate-x-5 opacity-0 scale-0 duration-300"
              : "duration-0 translate-x-3"
          } fill-current absolute transition-all`}
        />
        <Play
          size={20}
          style={{ transition: "colors 0.15" }}
          className={`${
            countLeft % 2 == 1
              ? "-translate-x-2 opacity-0 scale-0 duration-0"
              : "opacity-100 translate-x-0 scale-100 duration-300"
          } fill-current absolute transition-all`}
        />
        <Play
          size={20}
          style={{ transition: "colors 0.15" }}
          className={`${
            countLeft % 2 == 1
              ? "-translate-x-5 opacity-0 scale-0"
              : "opacity-100 translate-x-3 scale-100 duration-300"
          } fill-current absolute transition-all`}
        />
      </button>

      {/* Play Pause */}
      <button
        onClick={togglePlayPause}
        className="relative flex items-center justify-center hover:text-primary"
      >
        <Play
          size={28}
          className={`${
            isPlaying && "opacity-0 scale-0"
          } absolute fill-current transition-all duration-300`}
          style={{ transition: "colors 0.15" }}
        />
        <Pause
          size={28}
          className={`${
            !isPlaying && "opacity-0 scale-0"
          } absolute fill-current transition-all duration-300`}
          style={{ transition: "colors 0.15" }}
        />
      </button>

      {/* Play Next */}
      <button
        disabled={nextSongs.length == 0 && !playInfinity}
        onClick={() => {
          playNext();
          const now = new Date().getTime();
          if (now < last + 400) return;
          setLast(now);
          setCountRight((prev) => prev + 1);
          setTimeout(() => setCountRight((prev) => prev + 1), 100);
        }}
        className="group relative flex items-center hover:text-primary disabled:text-secondary"
      >
        <Play
          size={20}
          style={{ transition: "colors 0.15" }}
          className={`${
            countRight % 2 == 0
              ? "translate-x-3 opacity-0 scale-0 duration-300"
              : "duration-0"
          } fill-current absolute transition-all`}
        />
        <Play
          size={20}
          style={{ transition: "colors 0.15" }}
          className={`${
            countRight % 2 == 0
              ? "translate-x-5 opacity-0 scale-0 duration-300"
              : "duration-0 translate-x-3"
          } fill-current absolute transition-all`}
        />
        <Play
          size={20}
          style={{ transition: "colors 0.15" }}
          className={`${
            countRight % 2 == 1
              ? "-translate-x-2 opacity-0 scale-0 duration-0"
              : "opacity-100 translate-x-0 scale-100 duration-300"
          } fill-current absolute transition-all`}
        />
        <Play
          size={20}
          style={{ transition: "colors 0.15" }}
          className={`${
            countRight % 2 == 1
              ? "-translate-x-5 opacity-0 scale-0"
              : "opacity-100 translate-x-3 scale-100 duration-300"
          } fill-current absolute transition-all`}
        />
      </button>
    </div>
  );
};
