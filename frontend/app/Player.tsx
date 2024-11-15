"use client";
import React, { useEffect, useState } from "react";
import { Play, Pause, VolumeX, Volume, Volume1, Volume2, EyeOff, PanelBottomOpen } from "lucide-react";
import { useAudio } from "@/components/provider/audio-provider";
import { formatTime } from "@/lib/utils";
import { ProgressBar } from "@/components/my-ui/progress-bar";
import { useDisplay } from "@/components/provider/display-provider";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Player = () => {
  const { forceHidePlayer, displayPlayer, toggleDisplayPlayer } = useDisplay();

  return (
    <div className="w-screen h-screen fixed top-14 left-0 pointer-events-none">
      <div className="max-w-xxl w-full h-[calc(100vh-3.5rem)] mx-auto relative">
        <Tooltip>
          <TooltipTrigger
            onClick={toggleDisplayPlayer}
            className={`absolute right-3 ${
              !displayPlayer || forceHidePlayer 
              ? "bottom-3 pointer-events-auto"
              : "bottom-20 opacity-0 pointer-events-none"
            } border rounded-md transition-all backdrop-blur-sm duration-300 p-2 flex items-center justify-center hover:text-primary`}
          >
            <PanelBottomOpen size={24} />
          </TooltipTrigger>
          <TooltipContent>
            Show Player
          </TooltipContent>
        </Tooltip>
        <div
          className={`absolute ${
            displayPlayer && !forceHidePlayer
              ? "bottom-3"
              : "-bottom-14 opacity-0"
          } right-3 transition-all duration-300 ease-in-out h-16 hidden xl:flex gap-5 backdrop-blur-sm pointer-events-auto items-center`}
        >
          <ContextMenu>
            <ContextMenuTrigger>
              <div className="min-w-96 h-14 border bg-accent/0 rounded-lg flex justify-between gap-5 items-center px-2">
                <AudioProgress />
                <PlayButtons />
                <AudioVolume />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={toggleDisplayPlayer} className="group flex gap-1">
                <EyeOff size={16} className="group-hover:text-primary" />
                Hide
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
    </div>
  );
};

export const AudioProgress = () => {
  const { audioRef, isPlaying, currentTime, songDuration } = useAudio();
  const [timePercentage, setTimePercentage] = useState<number>(0);
  const [wasPlaying, setWasPlaying] = useState<boolean>(false);

  const setCurrentTime = (percentage: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    setTimePercentage(percentage);
    const realTime = (songDuration / 100) * percentage;
    audio.currentTime = realTime;
  };

  const handleMouseDown = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setWasPlaying(isPlaying);
    audio.pause();
  };

  const handleMouseUp = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (wasPlaying) {
      audio.play();
    }
    setWasPlaying(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setTimePercentage((currentTime / audio.duration) * 100);
  }, [currentTime, audioRef]);

  return (
    <div className="flex flex-col items-center relative w-96 h-6 justify-between">
      <div className="w-[calc(100%-1.3rem)] mx-auto mt-2 relative">
        <ProgressBar
          defaultProgress={100}
          currentProgress={timePercentage}
          updateProgress={setCurrentTime}
          handleMouseDown={handleMouseDown}
          handleMouseUp={handleMouseUp}
        />
      </div>
      <span className="absolute -bottom-3 text-sm text-secondary-foreground flex justify-between w-full no-select">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatTime(songDuration - currentTime)}</span>
      </span>
    </div>
  );
};

export const AudioVolume = () => {
  const { currentVolume, setCurrentVolume } = useAudio();

  return (
    <div className="flex items-center gap-2 relative w-36">
      <div className="relative flex items-center justify-center">
        <VolumeX
          size={24}
          className={`${
            currentVolume != 0 && "opacity-0"
          } transition-all duration-300`}
        />
        <Volume
          size={24}
          className={`${
            currentVolume != undefined && currentVolume <= 0 && "opacity-0"
          } absolute transition-all duration-300`}
        />
        <Volume1
          size={24}
          className={`${
            currentVolume != undefined && currentVolume <= 33 && "opacity-0"
          } absolute transition-all duration-300`}
        />
        <Volume2
          size={24}
          className={`${
            currentVolume != undefined && currentVolume <= 66 && "opacity-0"
          } absolute transition-all duration-300`}
        />
      </div>
      <ProgressBar
        defaultProgress={100}
        currentProgress={currentVolume || 0}
        updateProgress={setCurrentVolume}
      />
    </div>
  );
};

export const PlayButtons: React.FC = () => {
  const {
    isPlaying,
    togglePlayPause,
    playNext,
    playLast,
    nextSongs,
    songHistory,
    playInfinity,
  } = useAudio();
  const [countRight, setCountRight] = useState<number>(0);
  const [countLeft, setCountLeft] = useState<number>(0);
  const [last, setLast] = useState<number>(0);
  return (
    <div className="w-[7.25rem] flex items-center h-8">
      <div className="translate-x-7 flex gap-5 md:gap-7">
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
          className="group relative hidden sm:flex items-center hover:text-primary opacity-90 rotate-180 disabled:text-secondary-foreground"
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
          className="relative flex items-center justify-center hover:text-primary opacity-90"
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
          className="group relative flex items-center hover:text-primary opacity-90 disabled:text-secondary-foreground"
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
    </div>
  );
};
