"use client"
import { getPageSetting } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React, { useContext, createContext, useState, useEffect } from "react"

interface DisplayContextProps {
  displayPlayer: boolean;
  displaySongList: boolean;
  displayCurrentSong: boolean;
  forceHidePlayer: boolean;
  forceHideSongList: boolean;
  forceHideCurrentSong: boolean;
  toggleDisplayPlayer: () => void;
  toggleDisplaySongList: () => void;
  toggleDisplayCurrentSong: () => void;
}

const DisplayContext = createContext<DisplayContextProps | undefined>(undefined);

export const DisplayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [displayPlayer, setDisplayPlayer] = useState<boolean>(true);
  const [displaySongList, setDisplaySongList] = useState<boolean>(true);
  const [displayCurrentSong, setDisplayCurrentSong] = useState<boolean>(true);
  const [forceHidePlayer, setForceHidePlayer] = useState<boolean>(false);
  const [forceHideSongList, setForceHideSongList] = useState<boolean>(false);
  const [forceHideCurrentSong, setForceHideCurrentSong] = useState<boolean>(false);

  useEffect(() => {
    const display = !!getPageSetting(pathname, 'playerHidden');
    setForceHidePlayer(display);
    setForceHideSongList(display);
    setForceHideCurrentSong(display);
  }, [pathname]);

  const toggleDisplayPlayer = () => setDisplayPlayer(prev => !prev);
  const toggleDisplaySongList = () => setDisplaySongList(prev => !prev);
  const toggleDisplayCurrentSong = () => setDisplayCurrentSong(prev => !prev);

  return (
    <DisplayContext.Provider
      value={{
        displayPlayer,
        displaySongList,
        displayCurrentSong,
        forceHideCurrentSong,
        forceHidePlayer,
        forceHideSongList,
        toggleDisplayPlayer,
        toggleDisplaySongList,
        toggleDisplayCurrentSong,
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