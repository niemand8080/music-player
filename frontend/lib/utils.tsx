import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SongType = {
  name: string;
  file_exists: boolean;
  artist_track_id: string;
  artist_name: string;
  album: string;
  genres: string;
  birth_date: number;
  duration: number;
  global_played: number;
  added: number;
  track_id: string;
  last_played: number;
  path: string;
  yt_link: string;
};
