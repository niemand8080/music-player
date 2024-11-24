"use client"
import { api, MediaType } from "@/lib/utils"
import React, { createContext, useContext } from "react"
import { useUser } from "./user-provider";
import { useAlert } from "./alert-provider";

interface MediaActionProvider {
  toggleLibrary: (media: MediaType) => void;
  toggleFavorite: (media: MediaType) => void;
}

const MediaActionContext = createContext<MediaActionProvider | undefined>(undefined);

export const MediaActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authorized } = useUser();
  const { newAlert } = useAlert();
  
  const toggleLibrary = async (media: MediaType) => {
    if (!authorized) return;
    const newValue = !media.added_to_library;
    const updated = await updateUSD(media.track_id, "added_to_library", newValue)
    if (updated) {
      media.added_to_library = newValue;
      if (newValue) newAlert("success", "Added to Library");
      else newAlert("success", "Removed from Library");
    }
  };

  const toggleFavorite = async (media: MediaType) => {
    if (!authorized) return;
    const newValue = !media.favorite;
    const updated = await updateUSD(media.track_id, "favorite", newValue)
    if (updated) media.favorite = newValue;
    if (newValue) newAlert("success", "Marked Favorite");
    else newAlert("success", "Favorite Revoked");
  }

  return (
    <MediaActionContext.Provider
      value={{
        toggleLibrary,
        toggleFavorite,
      }}
    >
      {children}
    </MediaActionContext.Provider>
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

export const useMediaAction = () => {
  const context = useContext(MediaActionContext);
  if (!context) {
    throw new Error("useMediaAction has to be called inside an MediaActionProvider");
  }
  return context;
}