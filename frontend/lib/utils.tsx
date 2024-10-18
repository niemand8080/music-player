import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SongType = {
  name: string;
  file_exists: boolean;
  artist_track_id: string;
  artist_name: string | null;
  album: string | null;
  genres: string | null;
  birth_date: number;
  duration: number;
  global_played: number;
  added: number;
  track_id: string;
  last_played: number;
  path: string;
  yt_link: string | null;
  img_url: string | null;
  favorite: boolean | null;
  rating: number | null;
  i_last_played: number | null;
  skip_count: number | null;
};

export const formatTime = (sec: number): string => {
  const days = Math.floor(sec / (60 * 60 * 24));
  const hours = Math.floor(sec / (60 * 60));
  const minutes = Math.floor(sec / 60);
  const seconds = String(sec % 60).padStart(2, '0');
  
  if (days > 0) return `${days}days ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min ${seconds}s`;
  
  return `${minutes}:${seconds}`
}