"use client"
import { UserStar } from '@/components/my-ui/user';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { api, MediaType } from '@/lib/utils';
import React, { useEffect, useState } from 'react'

const Page = () => {
  const [videos, setVideos] = useState<MediaType[]>([]);
  const [currentVideo, setCurrentVideo] = useState<MediaType>();

  useEffect(() => {
    const loadVideos = async () => {
      const response: MediaType[] = await api('/videos');
      setVideos(response);
      setCurrentVideo(response[0])
    };
    loadVideos();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* <h1 className='mx-auto text-9xl py-4 font-semibold'>Videos</h1> */}
      <div className="flex gap-2 md:mx-3 w-full">
        <CurrentVideo video={currentVideo} />
      </div>
      {/* <div className='mx-auto grid grid-cols-4 gap-5'>
        {videos.slice(0, 1).map((video, index) => (
          <VideoCard video={video} key={index} />
        ))}
      </div> */}
    </div>
  )
};

const CurrentVideo: React.FC<{ video: MediaType | undefined }> = ({ video }) => {
  if (!video)
    return (
      <></>
    )
  const { name, artist_name, track_id } = video;
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full">
        <AspectRatio ratio={16 / 9}>
          <video 
            src={`https://192.168.7.146:8000/api/watch?t=${track_id}`}
            className="rounded-lg border"
            controls
          />
        </AspectRatio>
      </div>
      <div className='flex justify-between items-center'>
        <div className='cursor-default'>
          <h3 className="text-xl font-bold">{name}</h3>
          <h4 className="text-lg text-secondary-foreground">{artist_name}</h4>
        </div>
        <div>
          <UserStar 
            
          />
        </div>
      </div>
    </div>
  )
}

const VideoCard: React.FC<{ video: MediaType }> = ({ video }) => {
  const { name, artist_name, track_id } = video;
  return (
    <div className="w-96 h-80 flex flex-col gap-1">
      <div className="w-full">
        <AspectRatio ratio={16 / 9}>
          <video 
            src={`https://192.168.7.146:8000/api/watch?t=${track_id}`}
            className="rounded-lg border"
            controls
          />
        </AspectRatio>
      </div>
      <div>
        {name}
      </div>
    </div>
  )
}

export default Page