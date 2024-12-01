import { formatTime, simpleFilter, MediaType } from "@/lib/utils";
import { useMediaAction } from "../provider/media-action-provider";
import { useUser } from "../provider/user-provider";
import { useAudio } from "../provider/audio-provider";
import {
  Ellipsis,
  Library,
  ListEnd,
  ListStart,
  Pause,
  Play,
  Star,
  StarOff,
  VolumeX,
  Volume,
  Volume1,
  Volume2,
  X,
  Youtube,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { useDisplay } from "../provider/display-provider";
import { ProgressBar } from "./progress-bar";
import { ImageWithFallback } from "./img";

export const SongOptions: React.FC<{ song: MediaType }> = ({ song }) => {
  const { user, authorized } = useUser();
  const { toggleLibrary, toggleFavorite, copyTrack } = useMediaAction();
  const { addLast, addNext } = useAudio();
  const { added_to_library, favorite, yt_link } = song;
  const disable = user == undefined || !authorized;

  const getClass = (state: boolean) =>
    `${
      state
        ? "group-hover:text-destructive group-hover:fill-destructive"
        : "group-hover:text-primary group-hover:fill-primary"
    } transition-all duration-300`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full my-auto">
          <Ellipsis
            size={24}
            className="rounded-full hover:text-primary transition-all duration-300 hover:bg-primary/10 p-0.5"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="group flex gap-1"
            onClick={() => copyTrack(song)}
          >
            <Copy
              size={16}
              className={`group-hover:text-primary transition-all duration-300`}
            />
            <span>Copy Track</span>
          </DropdownMenuItem>
          {yt_link != null && (
            <>
              <DropdownMenuItem
                className="group flex gap-1"
                onClick={() => window.open(yt_link, "_blank")}
              >
                <Youtube
                  size={16}
                  className={`group-hover:text-primary transition-all duration-300`}
                />
                <span>Open in YT</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="group flex gap-1"
            onClick={() => addNext(song)}
          >
            <ListStart
              size={16}
              className={`group-hover:text-primary transition-all duration-300`}
            />
            <span>Play Next</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="group flex gap-1"
            onClick={() => addLast(song)}
          >
            <ListEnd
              size={16}
              className={`group-hover:text-primary transition-all duration-300`}
            />
            <span>Play Last</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="group flex gap-1"
            disabled={disable}
            onClick={() => toggleFavorite(song)}
          >
            {favorite ? (
              <StarOff size={16} className={`${getClass(favorite || false)}`} />
            ) : (
              <Star size={16} className={`${getClass(favorite || false)}`} />
            )}
            <span>{favorite ? "Favorite Revoked" : "Mark Favorite"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="group flex gap-1"
            disabled={disable}
            onClick={() => toggleLibrary(song)}
          >
            <Library
              size={16}
              className={`${getClass(added_to_library || false)}`}
            />
            <span>{added_to_library ? "Remove from" : "Add to"} Library</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const SongWithContext: React.FC<{
  song: MediaType;
  children: React.ReactNode;
}> = ({ song, children }) => {
  const { user, authorized } = useUser();
  const { toggleLibrary, toggleFavorite, copyTrack } = useMediaAction();
  const { addLast, addNext } = useAudio();
  const { added_to_library, favorite, yt_link } = song;
  const disable = user == undefined || !authorized;

  const getClass = (state: boolean) =>
    `${
      state
        ? "group-hover:text-destructive group-hover:fill-destructive"
        : "group-hover:text-primary group-hover:fill-primary"
    } transition-all duration-300`;

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          className="group flex gap-1"
          onClick={() => copyTrack(song)}
        >
          <Copy
            size={16}
            className={`group-hover:text-primary transition-all duration-300`}
          />
          <span>Copy Track</span>
        </ContextMenuItem>
        {yt_link != null && (
          <>
            <ContextMenuItem
              className="group flex gap-1"
              onClick={() => window.open(yt_link, "_blank")}
            >
              <Youtube
                size={16}
                className={`group-hover:text-primary transition-all duration-300`}
              />
              <span>Open in YT</span>
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          className="group flex gap-1"
          onClick={() => addNext(song)}
        >
          <ListStart
            size={16}
            className={`group-hover:text-primary transition-all duration-300`}
          />
          <span>Play Next</span>
        </ContextMenuItem>
        <ContextMenuItem
          className="group flex gap-1"
          onClick={() => addLast(song)}
        >
          <ListEnd
            size={16}
            className={`group-hover:text-primary transition-all duration-300`}
          />
          <span>Play Last</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="group flex gap-1"
          disabled={disable}
          onClick={() => toggleFavorite(song)}
        >
          {favorite ? (
            <StarOff size={16} className={`${getClass(favorite || false)}`} />
          ) : (
            <Star size={16} className={`${getClass(favorite || false)}`} />
          )}
          <span>{favorite ? "Favorite Revoked" : "Mark Favorite"}</span>
        </ContextMenuItem>
        <ContextMenuItem
          className="group flex gap-1"
          disabled={disable}
          onClick={() => toggleLibrary(song)}
        >
          <Library
            size={16}
            className={`${getClass(added_to_library || false)}`}
          />
          <span>{added_to_library ? "Remove from" : "Add to"} Library</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const CompactPlayer: React.FC<{ progressBg?: string }> = ({
  progressBg,
}) => {
  return (
    <div className="h-full w-full flex flex-col justify-around xl:hidden">
      <div className="px-4">
        <AudioProgress progressBg={progressBg} />
      </div>
      <div className="mx-auto">
        <PlayButtons showBack />
      </div>
      <div className="px-4">
        <AudioVolume progressBg={progressBg} />
      </div>
    </div>
  );
};

export const CurrentSongDisplay: React.FC<{
  song: MediaType | undefined;
  options?: boolean;
  big?: boolean;
}> = ({ song, options = true, big = false }) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  if (!song)
    return (
      <div
        className={`${
          big
            ? "flex flex-col gap-10"
            : "md:p-5 md:pt-3 md:pb-0 xl:p-2 gap-3 flex md:flex-col xl:flex-row "
        } w-full h-full rounded-md items-center`}
      >
        <Skeleton
          className={`${
            big ? "w-72 h-72" : "w-12 h-12 md:w-40 md:h-40 xl:w-12 xl:h-12"
          } rounded-md`}
        />
        <div className="gap-2 flex flex-col h-12 justify-center mr-auto">
          <Skeleton className="h-4 w-44 sm:w-64" />
          <Skeleton className="h-4 w-32 sm:w-44" />
        </div>
      </div>
    );

  return (
    <div
      className={`${
        big
          ? "flex flex-col gap-14 justify-between"
          : "md:p-5 md:pt-3 md:pb-0 xl:p-2 gap-3 flex md:flex-col xl:flex-row "
      } w-full h-full rounded-md items-center`}
    >
      <div
        className={`${
          big ? "w-72 h-72" : "w-12 h-12 md:w-40 md:h-40 xl:w-12 xl:h-12"
        } w-12 h-12 block md:hidden xl:block min-w-12 min-h-12 relative`}
      >
        <ImageWithFallback
          url={song.img_url || "fallback"}
          fallbackSrc={{ url: `https://img.youtube.com/vi/${song.yt_id}/`, append: "yt" }}
          fill
          alt="Song Cover"
          onLoad={() => setImageLoaded(true)}
          width={big ? 288 : 48}
          height={big ? 288 : 48}
          className={`${
            imageLoaded ? "opacity-100" : "opacity-0"
          } absolute rounded-md z-20 h-full`}
        />
      </div>
      <div className="w-40 h-40 hidden md:block xl:hidden min-w-40 min-h-40 relative">
        <ImageWithFallback
          url={`https://img.youtube.com/vi/${song.yt_id}/maxresdefault.jpg`}
          fallbackSrc={{ url: `https://img.youtube.com/vi/${song.yt_id}/`, append: "yt" }}
          fill
          alt="Song Cover"
          onLoad={() => setImageLoaded(true)}
          width={160}
          height={160}
          className={`${
            imageLoaded ? "opacity-100" : "opacity-0"
          } absolute rounded-md z-20 h-full`}
        />
      </div>
      <div
        className={`${
          big && "relative"
        } flex justify-between w-full h-full relative`}
      >
        <div
          className={`${
            big ? "h-10 absolute bottom-0 left-0" : "h-full"
          } justify-center flex flex-col w-full md:w-auto xl:w-[calc(100%-1.5rem)]`}
        >
          <h1 className="truncate w-44 sm:w-full md:w-[260px] font-bold">
            {song.name}
          </h1>
          <h2 className="truncate w-44 sm:w-full md:w-[260px] text-foreground/50 md:text-secondary-foreground">
            {song.artist_name}
          </h2>
        </div>
        {(options || big) && (
          <div
            className={`${
              big ? "bottom-0" : "top-1/2 -translate-y-1/2"
            } absolute right-0`}
          >
            <SongOptions song={song} />
          </div>
        )}
      </div>
    </div>
  );
};

export const NextSongsList: React.FC<{ filter: string }> = ({ filter }) => {
  const { nextSongs } = useAudio();
  const { toggleDisplaySongList } = useDisplay();
  const [displaySongs, setDisplaySongs] = useState<MediaType[]>();

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

export const SongDisplay: React.FC<{ song: MediaType | undefined }> = ({
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
          <ImageWithFallback
            url={`https://img.youtube.com/vi/${song.yt_id}/maxresdefault.jpg`}
            fallbackSrc={{ url: `https://img.youtube.com/vi/${song.yt_id}/`, append: "yt" }}
            fill
            alt="Song Cover"
            onLoad={() => setImageLoaded(true)}
            width={48}
            height={48}
            className={`${
              imageLoaded ? "opacity-100" : "opacity-0"
            } absolute rounded-md h-full`}
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

export const AudioProgress: React.FC<{ progressBg?: string }> = ({
  progressBg,
}) => {
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
    <div className="flex flex-col items-center relative w-full h-6 justify-between">
      <div className="w-[calc(100%-1.3rem)] mx-auto mt-2 relative">
        <ProgressBar
          defaultProgress={100}
          currentProgress={timePercentage}
          updateProgress={setCurrentTime}
          handleMouseDown={handleMouseDown}
          handleMouseUp={handleMouseUp}
          progressBg={progressBg}
        />
      </div>
      <span className="absolute -bottom-3 text-sm text-secondary-foreground flex justify-between w-full no-select">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatTime(songDuration - currentTime)}</span>
      </span>
    </div>
  );
};

export const AudioVolume: React.FC<{ progressBg?: string }> = ({
  progressBg,
}) => {
  const { currentVolume, setCurrentVolume } = useAudio();

  return (
    <div className="flex items-center gap-2 relative w-full">
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
        progressBg={progressBg}
      />
    </div>
  );
};

export const PlayButtons: React.FC<{ showBack?: boolean }> = ({ showBack }) => {
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
    <div
      className={`${
        showBack ? "w-[7.25rem]" : "w-[5.75rem] sm:w-[7.25rem]"
      } flex items-center h-8`}
    >
      <div
        className={`${
          showBack ? "gap-7" : "gap-5"
        } translate-x-7 flex md:gap-7 transition-all duration-300`}
      >
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
          className={`${
            showBack ? "flex" : "hidden sm:flex"
          } group relative items-center hover:text-primary opacity-90 rotate-180 disabled:text-secondary-foreground`}
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
