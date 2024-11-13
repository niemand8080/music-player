"use client";
import { SongOptions } from "@/components/my-ui/song";
import { useAudio } from "@/components/provider/audio-provider";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { formatTime, getPageSetting, SongType } from "@/lib/utils";
import { Infinity, Search, Shuffle, Repeat } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

export const SongList = () => {
  const pathname = usePathname();
  const { currentSong } = useAudio();
  if (getPageSetting(pathname, 'playerHidden')) return null;
  return (
    <div className="w-screen h-screen fixed top-14 left-0 pointer-events-none">
      <div className="max-w-xxl w-full h-[calc(100vh-3.5rem)] mx-auto relative">
        <div className="absolute top-0 left-0 h-full w-96 pt-2 pl-5 pb-5 flex justify-between flex-col pointer-events-auto">
          <div className="relative w-full h-[calc(100%-4.8rem)] bg-popover/20 border rounded-lg flex flex-col z-10">
            <div className="absolute top-0 left-0 overflow-hidden rounded-lg backdrop-blur-sm w-full h-full align-bottom">
              <NextSongsList />
            </div>
            <SongListOptions />
          </div>
          <div className="w-full h-16 border-t bg-popover/20 backdrop-blur-sm border rounded-lg flex items-center justify-center z-10">
            <CurrentSongDisplay song={currentSong} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const NextSongsList = () => {
  const { nextSongs } = useAudio();
  return (
    <div className="w-full h-full flex flex-col-reverse overflow-y-scroll">
      {nextSongs.length > 0 ? nextSongs.map((song, index) => (
        <div key={index} className="h-16">
          <SongDisplay song={song} />
        </div>
      )) : (
        <div className="text-secondary-foreground w-full h-full items-end justify-center pb-5 flex">
          <span>No Songs..</span>
        </div>
      )}
      {nextSongs.length > 0 && (
        <div className="text-secondary-foreground w-full items-center justify-center flex pt-2 no-select">
          {nextSongs.length} Songs
          {" "}{formatTime(nextSongs.map(s => s.duration).reduce((a, b) => a + b))}
        </div>
      )}
    </div>
  )
}

export const SongDisplay: React.FC<{ song: SongType | undefined }> = ({
  song,
}) => {
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
    <div className="w-full h-full flex items-center p-2 gap-3 hover:bg-accent no-select">
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
          className={`${imageLoaded ? "opacity-100" : "opacity-0"} absolute rounded-md`}
        />
        <Skeleton className={`${imageLoaded ? "opacity-0" : "opacity-100"} absolute h-12 w-12 rounded-md`} />
      </div>
      <div className="flex justify-between w-full h-full">
        <div className="flex flex-col h-full justify-center w-[calc(100%-1.5rem)] pointer-events-none">
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

export const SongListOptions = () => {
  const {
    togglePlayInfinity,
    toggleIsShuffled,
    toggleRepeat,
    isShuffled,
    playInfinity,
    repeat,
  } = useAudio();

  return (
    <div className="absolute bottom-0 left-0 border-t w-full h-14 backdrop-blur-sm bg-popover/50 items-center px-2 flex gap-2 justify-between rounded-b-lg">
      <div
        className={`w-56 items-center flex relative transition-all duration-300`}
      >
        <Input
          onFocus={(e) => e.target.select()}
          type={"text"}
          className={`peer pl-8 w-full transition-all duration-300 ease-in-out`}
          placeholder="Filter"
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
          className={`${imageLoaded ? "opacity-100" : "opacity-0"} absolute rounded-md`}
        />
        <Skeleton className={`${imageLoaded ? "opacity-0" : "opacity-100"} absolute h-12 w-12 rounded-md`} />
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
