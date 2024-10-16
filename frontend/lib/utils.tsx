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
  listen_time_seconds: number;
  added: number;
  track_id: string;
  last_played: number;
  path: string;
  yt_link: string | null;
  img_url: string | null;
  // if logged in
  favorite: boolean | null;
  rating: number | null;
  i_last_played: number | null;
  skip_count: number | null;
  my_listen_time_seconds: number | null;
  added_to_library: boolean | null;
};

export const pad = (num: number, length = 2, start = true): string =>
  start ? String(num).padStart(length, "0") : String(num).padEnd(length, "0");

export const formatTime = (sec: number, type?: "ago" | "listen_time"): string => {
  const days = Math.floor(sec / (60 * 60 * 24));
  const hours = Math.floor(sec / (60 * 60) % 24);
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);

  if (type == "ago") {
    if (days > 0) return `${days}day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours}h${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes}min${minutes > 1 ? "s" : ""} ago`;
    else return `${seconds}s ago`;
  }

  if (type == "listen_time") {
    const arr = [`${seconds}s`];

    if (minutes > 0) arr.push(`${minutes}min${minutes > 1 ? "s" : ""}`);
    if (hours > 0) arr.push(`${hours}h${hours > 1 ? "s" : ""}`);
    if (days > 0) arr.push(`${days}day${days > 1 ? "s" : ""}`);
    arr.reverse();

    return [arr[0], arr[1]].join(" ");
  }

  if (days > 0) return `${days}D ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;

  return `${minutes}:${pad(seconds)}`;
};
