"use client";
import { useAudio } from "@/components/provider/audio-provider";
import { useDisplay } from "@/components/provider/display-provider";
import { Input } from "@/components/ui/input";
import {
  Infinity,
  Search,
  Shuffle,
  Repeat,
  PanelLeftOpen,
  EyeOff, 
  PanelBottomOpen,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { TheTooltip } from "@/components/my-ui/the-tooltip";
import { Toggle } from "@/components/ui/toggle";
import { CompactPlayer, 
  CurrentSongDisplay, 
  NextSongsList, 
  AudioProgress, 
  AudioVolume, 
  PlayButtons 
} from "@/components/my-ui/song";
import { ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuTrigger 
} from "@/components/ui/context-menu";

export const SongList = () => {
  const { currentSong } = useAudio();
  const {
    forceHideSongList,
    forceHideCurrentSong,
    displaySongList,
    displayCurrentSong,
    toggleDisplaySongList,
    forceHidePlayer, 
    displayPlayer, 
    toggleDisplayPlayer
  } = useDisplay();
  const [filter, setFilter] = useState<string>("");
  const [fullPlayer, setFullPlayer] = useState<boolean>(false);

  return (
    <div className="w-screen h-[calc(100vh-3.5rem)] fixed top-14 left-0 pointer-events-none z-30">
      <div className="max-w-xxl w-full h-full mx-auto relative">
        {/* Song List / Current Song */}
        <TheTooltip
          text={"Show List"}
          triggerClick={toggleDisplaySongList}
          triggerClass={`
            ${
              !displaySongList && !forceHideSongList
                ? "md:pointer-events-auto md:opacity-100 md:-translate-x-0"
                : "md:opacity-0 md:pointer-events-none md:translate-x-96"
            } transition-all duration-300 -translate-x-20 opacity-0 border w-fit p-2 hover:text-primary rounded-md mt-2 ml-3`}
        >
          <PanelLeftOpen size={20} />
        </TheTooltip>
        <div className="absolute top-0 left-0 h-full w-96 pt-2 pl-3 pb-3 flex justify-between flex-col">
          <div
            className={`${
              !displaySongList || forceHideSongList
                ? "md:-translate-x-[25rem] md:opacity-0"
                : "md:opacity-100 md:-translate-x-0"
            } transition-all duration-300 -translate-x-[25rem] relative w-full h-[calc(100%-28.25rem)] xl:h-[calc(100%-8.25rem)] bg-popover/20 border rounded-lg flex flex-col pointer-events-auto`}
          >
            <div className="absolute top-0 left-0 overflow-hidden rounded-lg backdrop-blur-sm w-full h-full align-bottom">
              <NextSongsList filter={filter} />
            </div>
          </div>

          <div
            className={`${
              !displayCurrentSong || forceHideCurrentSong
                ? "md:-translate-x-[25rem] md:opacity-0"
                : "md:opacity-100 md:-translate-x-0"
            }
            ${
              !displaySongList || forceHideSongList
                ? "h-92 xl:h-16 border"
                : "h-[27.5rem] xl:h-[7.5rem] border"
            } transition-all duration-300 -translate-x-[25rem] pointer-events-none md:pointer-events-auto opacity-0 backdrop-blur-sm relative w-full bg-popover/20 rounded-lg justify-between xl:justify-normal flex flex-col mt-3`}
          >
            <div>
              <SongListOptions
                hidden={!displaySongList || forceHideSongList}
                setFilter={setFilter}
              />
            </div>
            <div
              className={`${
                !displaySongList || forceHideSongList
                  ? "xl:rounded-lg rounded-t-lg xl:border-b h-64 xl:h-auto"
                  : "xl:rounded-b-lg h-64 xl:h-16"
              } w-full flex items-center justify-center`}
            >
              <CurrentSongDisplay song={currentSong} />
            </div>
            <div className="w-full h-32">
              <CompactPlayer />
            </div>
          </div>
        </div>

        {/* Player */}
        <TheTooltip
          text={"Show Player"}
          triggerClick={toggleDisplayPlayer}
          triggerClass={`absolute right-3 ${
            !displayPlayer && !forceHidePlayer 
            ? "xl:bottom-3 xl:opacity-100 xl:pointer-events-auto hover:text-primary"
            : "xl:bottom-20 xl:opacity-0 xl:pointer-events-none"
          } border rounded-md transition-all opacity-0 backdrop-blur-sm duration-300 p-2 flex items-center justify-center`}
        >
          <PanelBottomOpen size={20} />
        </TheTooltip>
        <div
          className={`absolute ${
            displayPlayer && !forceHidePlayer
              ? "xl:bottom-3 xl:opacity-100"
              : "xl:-bottom-16 xl:opacity-0"
          } right-3 transition-all duration-300 -bottom-16 opacity-0 h-16 flex gap-5 backdrop-blur-sm pointer-events-auto items-center`}
        >
          <ContextMenu>
            <ContextMenuTrigger>
              <div className="min-w-96 h-14 border bg-accent/0 rounded-lg flex justify-between gap-5 items-center px-2">
                <div className="w-96">
                  <AudioProgress />
                </div>
                <PlayButtons />
                <div className="w-36">
                  <AudioVolume />
                </div>
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

        {/*  */}
        <div className="w-screen max-w-3xl h-[calc(100vh-6.5rem)] relative">
          <div 
            onClick={() => !fullPlayer && setFullPlayer(true)}
            className={`${
                fullPlayer 
                ? "w-full left-0 h-screen px-5 bottom-0 z-50 bg-accent flex-col pt-10 pb-10"
                : "w-[calc(100%-1.5rem)] h-16 left-1/2 -translate-x-1/2 px-2 bottom-2 bg-accent/70 cursor-pointer rounded-lg"
              } absolute md:-bottom-20 transition-all backdrop-blur-sm pointer-events-auto flex items-center justify-between`}
          >
            {fullPlayer && (
              <button onClick={() => setFullPlayer(false)} className="absolute top-0 left-0 w-full h-10 flex items-center justify-center no-select">
                <div className="w-1/2 h-1/3 bg-foreground/10 rounded-full" />
              </button>
            )}
            <div 
              className={`${fullPlayer ? "w-[calc(100%-2rem)]" : "w-[calc(100%-2rem)]"} md:opacity-0 md:pointer-events-none`}
            >
              <CurrentSongDisplay song={currentSong} options={false} big={fullPlayer} />
            </div>
            <div className={`${fullPlayer && "hidden"}`}>
              <PlayButtons />
            </div>
            <div className={`${fullPlayer ? "w-full h-48" : "hidden"}`}>
              <CompactPlayer progressBg="bg-foreground/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SongListOptions: React.FC<{
  hidden?: boolean;
  setFilter: (s: string) => void;
}> = ({ hidden, setFilter }) => {
  const {
    togglePlayInfinity,
    toggleIsShuffled,
    toggleRepeat,
    isShuffled,
    playInfinity,
    repeat,
    nextSongs,
  } = useAudio();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setFilter(value);
  }, [nextSongs, value, setFilter]);

  return (
    <div
      className={`${
        hidden ? "h-0 opacity-0" : "h-14"
      } transition-all duration-300 w-full bg-popover/50 items-center px-2 flex gap-2 justify-between rounded-t-lg`}
    >
      <div
        className={`w-56 items-center flex relative transition-all duration-300`}
      >
        <Input
          onFocus={(e) => e.target.select()}
          type={"text"}
          className={`peer pl-8 w-full transition-all duration-300`}
          placeholder="Filter"
          onChange={(e) => setValue(e.target.value)}
        />
        <Search
          size={16}
          className={`cursor-pointer absolute left-[10px] text-secondary-foreground peer-focus:text-foreground transition-all duration-300`}
        />
      </div>
      <Toggle
        pressed={playInfinity}
        onPressedChange={togglePlayInfinity}
        value="infinity"
        variant={"primary"}
      >
        <Infinity size={20} className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={isShuffled}
        onPressedChange={toggleIsShuffled}
        value="shuffle"
        variant={"primary"}
        disabled
      >
        <Shuffle size={20} className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={repeat}
        onPressedChange={toggleRepeat}
        value="repeat"
        variant={"primary"}
        disabled
      >
        <Repeat size={20} className="w-4 h-4" />
      </Toggle>
    </div>
  );
};