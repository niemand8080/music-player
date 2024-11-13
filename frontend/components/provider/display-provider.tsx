"use client"
import { getPageSetting } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React, { useContext, createContext, useState, useEffect } from "react"

interface DisplayContextProps {
  displayPlayer: boolean;
  displaySongList: boolean;
  displayCurrentSong: boolean;
  setDisplayPlayer: (b: boolean) => void;
  setDisplaySongList: (b: boolean) => void;
  setDisplayCurrentSong: (b: boolean) => void;
}

const DisplayContext = createContext<DisplayContextProps | undefined>(undefined);

export const DisplayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [displayPlayer, setDisplayPlayer] = useState<boolean>(true);
  const [displaySongList, setDisplaySongList] = useState<boolean>(true);
  const [displayCurrentSong, setDisplayCurrentSong] = useState<boolean>(true);

  useEffect(() => {
    const display = !getPageSetting(pathname, 'playerHidden');
    setDisplayPlayer(display);
    setDisplaySongList(display);
    setDisplayCurrentSong(display);
  }, [pathname]);

  return (
    <DisplayContext.Provider
      value={{
        displayPlayer,
        displaySongList,
        displayCurrentSong,
        setDisplayPlayer,
        setDisplaySongList,
        setDisplayCurrentSong,
      }}
    >
      {children}
    </DisplayContext.Provider>
  )
};

export const useDisplay = () => {
  const context = useContext(DisplayContext);
  if (!context) {
    throw new Error("useDisplay has to be called inside a DisplayProvider")
  }
  return context
}