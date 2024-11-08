import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Song
export type SongType = {
  name: string;
  file_exists: boolean;
  artist_id: string;
  artist_name: string | null;
  album: string | null;
  genre: string | null;
  tags: string[] | null;
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

export const sampleSong: SongType = {
  name: "Sample Song",
  file_exists: true,
  artist_id: "00000000",
  artist_name: "Sample Artist",
  album: "Sample Album",
  genre: "Sample Genre",
  tags: ["Some", "Sample", "Tags"],
  birth_date: 0,
  duration: 321,
  listen_time_seconds: 0,
  added: 0,
  track_id: "00000000",
  last_played: 0,
  path: "Sample Song.mp3",
  yt_link: "https://www.youtube.com",
  img_url:
    "https://as1.ftcdn.net/v2/jpg/04/62/93/66/1000_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg",
  // user only
  favorite: false,
  rating: 0,
  i_last_played: 0,
  skip_count: 0,
  my_listen_time_seconds: 0,
  added_to_library: false,
};

// Time
export const pad = (num: number, length = 2, start = true): string =>
  start ? String(num).padStart(length, "0") : String(num).padEnd(length, "0");

export const formatTime = (
  sec: number,
  type?: "ago" | "listen_time"
): string => {
  const days = Math.floor(sec / (60 * 60 * 24));
  const hours = Math.floor((sec / (60 * 60)) % 24);
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

// Download
export function download(
  name: string,
  data: string[],
  type: string = "text/plain"
) {
  const file = new File(data, name, {
    type,
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(file);

  link.href = url;
  link.download = file.name;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Page
export const pageSettings = [
  { path: "/auth", simpleHeader: true, playerHidden: true, noPadding: true },
  {
    path: "/auth/login",
    simpleHeader: true,
    playerHidden: true,
    noPadding: true,
  },
  {
    path: "/auth/sign-up",
    simpleHeader: true,
    playerHidden: true,
    noPadding: true,
  },
  {
    path: "/auth/verify-email",
    simpleHeader: true,
    playerHidden: true,
    noPadding: true,
  },
  {
    path: "/link-grabber",
    simpleHeader: true,
    playerHidden: true,
    noPadding: true,
  },
  {
    path: "/visualizer",
    simpleHeader: true,
    playerHidden: false,
    noPadding: true,
  },
];

export const getPageSetting = (
  pathname: string,
  setting: "simpleHeader" | "playerHidden" | "noPadding"
): boolean => {
  const page = pageSettings.filter((page) => page.path == pathname)[0];
  if (!page) return false;
  return page[setting];
};

// simple API request
export const api = async (
  path: string,
  method: "GET" | "POST" = "GET",
  data?: { [key: string]: any }
) => {
  try {
    if (method == "POST") {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + path,
        data,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } else {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + path, {
        withCredentials: true,
      });

      return response.data;
    }
  } catch (error) {
    console.log(`(${path}) Error: ${error}`);
    return false
  }
};
