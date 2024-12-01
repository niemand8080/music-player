"use client";
import React, { useEffect, useRef, useState } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import { MediaType } from "@/lib/utils";
import Image from "next/image";
import { Play } from "lucide-react";

export const Video: React.FC<{ video: MediaType, onPlay?: () => void, loadVideo?: boolean }> = ({ video, onPlay, loadVideo = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playVideo, setPlayVideo] = useState<boolean>(false);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (playVideo && videoElement) {
      videoElement.play();
    }
  }, [playVideo]);
  
  return (
    <>
      <AspectRatio ratio={16 / 9}>
        <div className="group rounded-lg border overflow-hidden w-full h-full relative">
          <div
            onClick={() => onPlay && onPlay() || setPlayVideo(true)}
            className={`${playVideo ? "pointer-events-none" : "hover:opacity-100"} 
              absolute w-full h-full items-center justify-center z-20 bg-black/50 
              flex cursor-pointer opacity-0 transition-all duration-300`}
          >
            <Play className="fill-foreground text-foreground size-2/12" />
          </div>
          {!playVideo && video.img_url && (
            <Image
              alt="Cover"
              src={video.img_url}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            />
          )}
          {loadVideo && (
            <video
              ref={videoRef}
              // onLoadedData={handleLoad}
              src={`https://192.168.7.146:8000/api/consume?t=${video.track_id}`}
              className="absolute min-w-full min-h-full"
              crossOrigin="anonymous"
              controls
            />
          )}
        </div>
      </AspectRatio>
    </>
  );
};
