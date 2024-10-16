"use client";
import { usePathname } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  togglePlayPause: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const stopPlyingOn = [
  "/auth",
  "/auth/login",
  "/auth/sign-up",
  "/auth/verify-email",
];

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = "https://192.168.7.146:8000/api/play?t=5bc3a58c";

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (stopPlyingOn.includes(pathname)) audio.pause();
    else if (isPlaying) audio.play();
    else audio.pause();
  }, [isPlaying, pathname]);

  const togglePlayPause = () => setIsPlaying((prev) => !prev)

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        isPlaying,
        togglePlayPause,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio can only be used within a AudioProvider");
  }
  return context;
};
