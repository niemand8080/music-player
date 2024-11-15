"use client";
import { SongOptions } from "@/components/my-ui/song";
import { useAudio } from "@/components/provider/audio-provider";
import { useDisplay } from "@/components/provider/display-provider";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { formatTime, simpleFilter, SongType } from "@/lib/utils";
import {
  Infinity,
  Search,
  Shuffle,
  Repeat,
  X,
  PanelLeftOpen,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { SongWithContext } from "@/components/my-ui/song";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export const SongList = () => {
  const { currentSong } = useAudio();
  const {
    forceHideSongList,
    forceHideCurrentSong,
    displaySongList,
    displayCurrentSong,
    toggleDisplaySongList,
  } = useDisplay();
  const [filter, setFilter] = useState<string>("");

  return (
    <div className="w-screen h-screen fixed top-14 left-0 pointer-events-none">
      <div className="max-w-xxl w-full h-[calc(100vh-3.5rem)] mx-auto relative">
        <Tooltip>
          <TooltipTrigger
            onClick={toggleDisplaySongList}
            className={`
              ${
                !displaySongList && !forceHideSongList
                  ? "pointer-events-auto"
                  : "opacity-0 pointer-events-none translate-x-96"
              } transition-all duration-300 ease-in-out border w-fit p-2 hover:text-primary rounded-md mt-2 ml-3`}
          >
            <PanelLeftOpen size={20} />
          </TooltipTrigger>
          <TooltipContent>Show List</TooltipContent>
        </Tooltip>
        <div className="absolute top-0 left-0 h-full w-96 pt-2 pl-3 pb-3 flex justify-between flex-col">
          <div
            className={`${
              !displaySongList || forceHideSongList
                ? "-translate-x-[25rem] opacity-0"
                : "opacity-100 -translate-x-0"
            } transition-all duration-300 ease-in-out relative w-full h-[calc(100%-8.25rem)] bg-popover/20 border rounded-lg flex flex-col z-10 pointer-events-auto`}
          >
            <div className="absolute top-0 left-0 overflow-hidden rounded-lg backdrop-blur-sm w-full h-full align-bottom">
              <NextSongsList filter={filter} />
            </div>
          </div>

          <div
            className={`${
              !displayCurrentSong || forceHideCurrentSong
                ? "-translate-x-[25rem] opacity-0"
                : "opacity-100 -translate-x-0"
            }
            ${
              !displaySongList || forceHideSongList ? "h-16 border" : "h-[7.5rem] border"
            } transition-all duration-300 ease-in-out relative w-full bg-popover/20 rounded-lg flex flex-col z-10 mt-3 pointer-events-auto`}
          >
            <SongListOptions
              hidden={!displaySongList || forceHideSongList}
              setFilter={setFilter}
            />
            <div
              className={`${
                !displaySongList || forceHideSongList
                  ? "rounded-lg border-b"
                  : "rounded-b-lg h-16"
              } w-full bg-popover/20 backdrop-blur-sm flex items-center justify-center z-10`}
            >
              <CurrentSongDisplay song={currentSong} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NextSongsList: React.FC<{ filter: string }> = ({
  filter,
}) => {
  const { nextSongs } = useAudio();
  const { toggleDisplaySongList } = useDisplay();
  const [displaySongs, setDisplaySongs] = useState<SongType[]>();

  useEffect(() => {
    if (filter == "") {
      setDisplaySongs(undefined);
      return;
    }
    const filtered = simpleFilter(filter, nextSongs);
    setDisplaySongs(filtered);
  }, [filter, nextSongs]);

  return (
    <div className="w-full h-full flex flex-col-reverse overflow-y-auto relative">
      <div className="fixed top-0 left-0 rounded-t-lg bg-gradient-to-b from-background to-transparent w-full h-14">
        <button
          onClick={toggleDisplaySongList}
          className="fixed top-1 right-1 hover:text-foreground transition-all p-1 rounded-md text-secondary-foreground"
        >
          <X size={20} />
        </button>
      </div>
      {displaySongs ? (
        displaySongs.map((song, index) => (
          <div key={index} className="h-16">
            <SongDisplay song={song} />
          </div>
        ))
      ) : nextSongs.length > 0 ? (
        nextSongs.map((song, index) => (
          <div key={index} className="h-16">
            <SongDisplay song={song} />
          </div>
        ))
      ) : (
        <div className="text-secondary-foreground w-full h-full items-end justify-center pb-5 flex no-select cursor-default">
          <span>No Songs..</span>
        </div>
      )}
      {!displaySongs && nextSongs.length > 0 && (
        <div className="text-secondary-foreground w-full items-center justify-center flex pt-10 no-select">
          {nextSongs.length} Songs{" "}
          {formatTime(nextSongs.map((s) => s.duration).reduce((a, b) => a + b))}
        </div>
      )}
    </div>
  );
};

export const SongDisplay: React.FC<{ song: SongType | undefined }> = ({
  song,
}) => {
  const { playSongInList } = useAudio();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  if (!song)
    return (
      <div className="w-full h-full flex gap-3 p-2">
        <Skeleton className="w-12 h-12 rounded-md" />
        <div className="gap-2 flex flex-col h-12 justify-center">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
    );
  return (
    <SongWithContext song={song}>
      <div
        onClick={() => playSongInList(song)}
        className="w-full h-full flex items-center p-2 gap-3 hover:bg-accent/50 no-select cursor-pointer"
      >
        <div className="w-12 h-12 min-w-12 min-h-12 relative">
          <Image
            src={
              song.img_url ||
              "https://niemand8080.de/db/images/Super%20Mario%20World%20Game%20Over%20LoFi%20Hip%20Hop%20Remix.png"
            }
            alt="Song Cover"
            onLoad={() => setImageLoaded(true)}
            width={48}
            height={48}
            className={`${
              imageLoaded ? "opacity-100" : "opacity-0"
            } absolute rounded-md`}
          />
          <Skeleton
            className={`${
              imageLoaded ? "opacity-0" : "opacity-100"
            } absolute h-12 w-12 rounded-md`}
          />
        </div>
        <div className="flex justify-between w-full h-full">
          <div className="flex flex-col h-full justify-center w-[calc(100%-1.5rem)] pointer-events-none">
            <h1 className="truncate w-[262px] font-bold">{song.name}</h1>
            <h2 className="truncate w-[262px] text-secondary-foreground">
              {song.artist_name}
            </h2>
          </div>
        </div>
      </div>
    </SongWithContext>
  );
};

export const SongListOptions: React.FC<{
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
      } transition-all duration-300 ease-in-out w-full bg-popover/50 items-center px-2 flex gap-2 justify-between rounded-t-lg`}
    >
      <div
        className={`w-56 items-center flex relative transition-all duration-300`}
      >
        <Input
          onFocus={(e) => e.target.select()}
          type={"text"}
          className={`peer pl-8 w-full transition-all duration-300 ease-in-out`}
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
      >
        <Shuffle size={20} className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={repeat}
        onPressedChange={toggleRepeat}
        value="repeat"
        variant={"primary"}
      >
        <Repeat size={20} className="w-4 h-4" />
      </Toggle>
    </div>
  );
};

export const CurrentSongDisplay: React.FC<{ song: SongType | undefined }> = ({
  song,
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  if (!song)
    return (
      <div className="w-full h-full rounded-md flex gap-3 p-2">
        <Skeleton className="w-12 h-12 rounded-md" />
        <div className="gap-2 flex flex-col h-12 justify-center">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
    );

  return (
    <div className="w-full h-full rounded-md flex items-center p-2 gap-3">
      <div className="w-12 h-12 min-w-12 min-h-12 relative">
        <Image
          src={
            song.img_url ||
            "https://niemand8080.de/db/images/Super%20Mario%20World%20Game%20Over%20LoFi%20Hip%20Hop%20Remix.png"
          }
          alt="Song Cover"
          onLoad={() => setImageLoaded(true)}
          width={48}
          height={48}
          className={`${
            imageLoaded ? "opacity-100" : "opacity-0"
          } absolute rounded-md`}
        />
        <Skeleton
          className={`${
            imageLoaded ? "opacity-0" : "opacity-100"
          } absolute h-12 w-12 rounded-md`}
        />
      </div>
      <div className="flex justify-between w-full h-full">
        <div className="flex flex-col h-full justify-center w-[calc(100%-1.5rem)]">
          <h1 className="truncate w-[262px] font-bold">{song.name}</h1>
          <h2 className="truncate w-[262px] text-secondary-foreground">
            {song.artist_name}
          </h2>
        </div>
        <SongOptions song={song} />
      </div>
    </div>
  );
};
