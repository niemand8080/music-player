"use client";
import React, { useState } from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "@/components/provider/audio-provider";
import { usePathname } from "next/navigation";
import { getPageSetting, SongType } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { BlurImg } from "@/components/my-ui/blur-img";
import { SongOptions } from "@/components/my-ui/song";

export const Player = () => {
  const pathname = usePathname();
  const { currentSong } = useAudio();  
  if (getPageSetting(pathname, 'playerHidden')) return null;

  return (
    <>
      <div className="max-w-[100vw] w-screen fixed bottom-0 left-0 border-t h-[65px] z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between p-2 mx-auto max-w-xxl">
          <SongDisplay song={currentSong} />
          <PlayButtons />
        </div>
      </div>
    </>
  );
};

export const SongDisplay: React.FC<{ song: SongType | undefined }> = ({ song }) => {
  if (!song) return (
    <div className="w-96 h-full rounded-md flex gap-2">
      <Skeleton className="w-12 h-12 rounded-md" />
      <div className="gap-2 flex flex-col h-12 justify-center">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  )
  return (
    <div className="w-96 h-full rounded-md flex gap-3">
      <BlurImg 
        src={song.img_url || "https://niemand8080.de/db/images/Super%20Mario%20World%20Game%20Over%20LoFi%20Hip%20Hop%20Remix.png"}
        alt="Song Cover"
        size={48}
        className="rounded-md"
      />
      <div className="flex flex-col h-12 justify-center">
        <h1 className="truncate w-64 font-bold">{song.name}</h1>
        <h2 className="truncate w-64 text-secondary-foreground">{song.artist_name}</h2>
      </div>
      <SongOptions song={song} />
    </div>
  )
};

export const PlayButtons: React.FC = () => {
  const { isPlaying, togglePlayPause, playNext, playLast, nextSongs, songHistory, playRandom } = useAudio();
  const [countRight, setCountRight] = useState<number>(0);
  const [countLeft, setCountLeft] = useState<number>(0);
  const [last, setLast] = useState<number>(0);
  return (
    <div className="flex gap-5 md:gap-7 mr-10">
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
        className="group relative hidden sm:flex items-center hover:text-primary rotate-180 disabled:text-secondary-foreground"
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
        disabled={nextSongs.length == 0 && !playRandom}
        onClick={() => {
          playNext();
          const now = new Date().getTime();
          if (now < last + 400) return;
          setLast(now);
          setCountRight((prev) => prev + 1);
          setTimeout(() => setCountRight((prev) => prev + 1), 100);
        }}
        className="group relative flex items-center hover:text-primary disabled:text-secondary-foreground"
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
