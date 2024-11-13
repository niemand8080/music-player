"use client"
import { api, SongType } from "@/lib/utils"
import React, { createContext, useContext, useState } from "react"
import { useUser } from "./user-provider";
import { useAlert } from "./alert-provider";

interface SongActionProvider {
  toggleLibrary: (song: SongType) => void;
  toggleFavorite: (song: SongType) => void;
}

const SongActionContext = createContext<SongActionProvider | undefined>(undefined);

export const SongActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authorized } = useUser();
  const { newAlert } = useAlert();
  
  const toggleLibrary = async (song: SongType) => {
    if (!authorized) return;
    const newValue = !song.added_to_library;
    const updated = await updateUSD(song.track_id, "added_to_library", newValue)
    if (updated) {
      song.added_to_library = newValue;
      if (newValue) newAlert("Added to Library", undefined, 2000, "success");
      else newAlert("Removed from Library", undefined, 2000, "success");
    }
  };

  const toggleFavorite = async (song: SongType) => {
    if (!authorized) return;
    const newValue = !song.favorite;
    const updated = await updateUSD(song.track_id, "favorite", newValue)
    if (updated) song.favorite = newValue;
    if (newValue) newAlert("Marked Favorite", undefined, 2000, "success");
    else newAlert("Favorite Revoked", undefined, 2000, "success");
  }

  return (
    <SongActionContext.Provider
      value={{
        toggleLibrary,
        toggleFavorite,
      }}
    >
      {children}
    </SongActionContext.Provider>
  )
};

type USDType = "last_played" | "listen_time_seconds" | "favorite" | "rating" | "skip_count" | "first_played" | "added_to_library";

const updateUSD = async (track_id: string, change: USDType, to: string | number | boolean): Promise<boolean> => {
  if (typeof to == "boolean") {
    if (to) to = 1
    else to = 0
  }
  const data = await api("/uusd", "POST", { track_id, change, to })
  if (data == false) return false;
  else return true
}

export const useSongAction = () => {
  const context = useContext(SongActionContext);
  if (!context) {
    throw new Error("useSongAction has to be called inside an SongActionProvider");
  }
  return context;
}