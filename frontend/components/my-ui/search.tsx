import React, { useState, useEffect } from "react";
import { ArtistType, MediaType } from "@/lib/utils";
import { Star, Library } from "lucide-react";
import { ImageWithFallback } from "./img";
import { MediaContext } from "./media";
import { ArtistContext } from "./artist";
import { Skeleton } from "../ui/skeleton";

interface SearchItem {
  onPathUpdate?: (path: string, info: string, type: "artist" | "song") => void;
}

export const MediaSearchItem: React.FC<SearchItem & { media: MediaType }> = ({ media, onPathUpdate }) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [currentMedia, setCurrentMedia] = useState<MediaType>();

  useEffect(() => {
    setCurrentMedia({...media});
  }, [media]);

  if (!currentMedia) return null;

  return (
    <MediaContext 
      media={currentMedia}
      handleUpdate={async (fn) => setCurrentMedia({...await fn(media)})}
    >
      <div className={`group w-full p-2 pl-1 flex gap-1 items-center hover:bg-foreground/10`}>
        <Star size={14} className={`${currentMedia.favorite ? "fill-primary text-primary" : "opacity-0"}`} />
        <div className="w-12 h-12 min-w-12 min-h-12 relative mr-2">
          <ImageWithFallback
            url={currentMedia.type == "s" ? `https://img.youtube.com/vi/${currentMedia.yt_id}/maxresdefault.jpg` : currentMedia.img_url || "fallback"}
            fallbackSrc={{ url: `https://img.youtube.com/vi/${currentMedia.yt_id}/`, append: "yt" }}
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
          <div className="flex flex-col h-full justify-center cursor-default">
            <h1 className="truncate font-bold">{currentMedia.name}</h1>
            <h2>
              <span
                onClick={() => onPathUpdate && onPathUpdate(`@${currentMedia.artist_name}`, currentMedia.artist_id, "artist")}
                className={`group-hover:text-foreground/60 text-foreground/40 cursor-pointer
                  group-hover:hover:text-primary transition-all duration-300 no-select`}
              >
                {currentMedia.artist_name}
              </span>
            </h2>
          </div>
        </div>
        <span className="text-foreground/40 no-select cursor-default flex items-center gap-1 group-hover:text-primary">
          {currentMedia.added_to_library && (<Library size={16} />) || ""}
          {currentMedia.type == "s" ? "Song" : "Video"}
        </span>
      </div>
    </MediaContext>
  )
};

export const ArtistSearchItem: React.FC<SearchItem & { artist: ArtistType }> = ({ artist, onPathUpdate }) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [currentArtist, setCurrentArtist] = useState<ArtistType>();

  useEffect(() => {
    setCurrentArtist({...artist});
  }, [artist]);

  if (!currentArtist) return null;

  return (
    <ArtistContext 
      artist={currentArtist}
      handleUpdate={async (fn) => setCurrentArtist({...await fn(artist)})}
    >
      <div 
        onClick={() => onPathUpdate && onPathUpdate(`@${artist.name}`, artist.artist_id, "artist")}
        className={`group w-full p-2 pl-1 flex gap-1 items-center hover:bg-foreground/10 cursor-pointer`}
      >
        <Star size={14} className={`${currentArtist.favorite ? "fill-primary text-primary" : "opacity-0"}`} />
        <div className="w-12 h-12 min-w-12 min-h-12 relative mr-2">
          <ImageWithFallback
            url={currentArtist.channel_img_url}
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
          <h1 
            className={`group-hover:text-primary transition-all duration-300 font-bold`}
          >
            {currentArtist.name}
          </h1>
        </div>
        <span className="text-foreground/40 no-select cursor-default flex items-center gap-1 group-hover:text-primary">
          Artist
        </span>
      </div>
    </ArtistContext>
  )
};

export const LoadingSearchItem = () => {
  return (
    <div 
      className={`w-full p-2 pl-5 flex gap-3 items-center`}
    >
      <div className="w-12 h-12 min-w-12 min-h-12 relative">
        <Skeleton className="h-12 w-12" />
      </div>
      <div className="flex flex-col justify-around w-full h-full">
        <h1 
          className={`group-hover:text-primary transition-all duration-300 font-bold`}
        >
          <Skeleton className="h-4 w-96" />  
        </h1>
        <Skeleton className="h-4 w-56" />  
      </div>
    </div>
  )
};