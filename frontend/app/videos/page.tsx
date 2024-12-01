"use client";
import { UserAddedToLibrary, UserStar, UserStarRating } from "@/components/my-ui/user";
import { Video } from "@/components/my-ui/video";
import { api, MediaType } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const track = searchParams.get('t');
  const [videos, setVideos] = useState<MediaType[]>([]);
  const [currentVideo, setCurrentVideo] = useState<MediaType>();

  useEffect(() => {
    const loadVideos = async () => {
      const response: MediaType[] = await api("/medias?mt=v");
      const [current, ...remaining] = response.sort((a, b) => a.track_id == track ? -1 : b.track_id == track ? 1 : 0);

      setCurrentVideo(current);
      setVideos(remaining);
    };
    loadVideos();
  }, [track]);

  return (
    <div className="w-full h-full flex flex-col gap-5">
      <div className="flex gap-2 w-full">
        <CurrentVideo video={currentVideo} />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full'>
        {videos.length > 0 && videos.map((video, index) => (
          <VideoCard video={video} key={index} />
        ))}
      </div>
    </div>
  );
};

const CurrentVideo: React.FC<{ video: MediaType | undefined }> = ({
  video,
}) => {
  console.log(video?.img_url);
  if (!video) return <></>;
  const { name, artist_name } = video;
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full">
        <Video video={video} />
      </div>
      <div className="flex justify-between items-center">
        <div className="cursor-default">
          <h3 className="text-xl font-bold">{name}</h3>
          <h4 className="text-lg text-secondary-foreground">{artist_name}</h4>
        </div>
        <div className="flex gap-2">
          <div className="bg-popover hover:bg-primary/10 border rounded-full transition-all">
            <UserStar media={video} />
          </div>
          <div className="bg-popover hover:bg-primary/10 border rounded-full transition-all">
            <UserStarRating media={video} />
          </div>
          <div className="bg-popover hover:bg-primary/10 border rounded-full transition-all">
            <UserAddedToLibrary media={video} />
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoCard: React.FC<{ video: MediaType }> = ({ video }) => {
  const { name } = video;
  const router = useRouter();

  const handlePlay = () => {
    window.location.href = `/videos?t=${video.track_id}`;
  };

  return (
    <div className="w-full h-80 flex flex-col gap-1">
      <div className="w-full">
        <Video video={video} onPlay={handlePlay} loadVideo={false} />
      </div>
      <div>{name}</div>
    </div>
  );
};

export default Page;