"use client"
import { api, ArtistType } from "@/lib/utils"
import React, { useContext, createContext } from "react"
import { useAlert } from "./alert-provider";
import { useUser } from "./user-provider";

interface ArtistActionProviderProps {
  copyArtistID: (artist: ArtistType) => void;
  openChannel: (artist: ArtistType) => void;
  toggleFavorite: (artist: ArtistType) => Promise<ArtistType>;
}

const ArtistActionContext = createContext<ArtistActionProviderProps | undefined>(undefined);

export const ArtistActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { newAlert } = useAlert();
  const { authorized } = useUser();

  const openChannel = (artist: ArtistType) => {
    if (artist.channel_id) window.open(`https://www.youtube.com/channel/${artist.channel_id}`, "_blank")
    else newAlert("error", "No Channel ID Found")
  }

  const copyArtistID = async (artist: ArtistType) => {
    navigator.clipboard.writeText(artist.artist_id);
    newAlert("success", "Copied to Clipboard")
  }

  const toggleFavorite = async (artist: ArtistType): Promise<ArtistType> => {
    if (!authorized) return artist;
    const newValue = !artist.favorite;
    const updated = await updateUAD(artist.artist_id, "favorite", newValue);
    if (updated) artist.favorite = newValue;
    if (newValue) newAlert("success", "Marked Favorite");
    else newAlert("success", "Favorite Revoked");
    return artist
  };

  return (
    <ArtistActionContext.Provider
      value={{
        copyArtistID,
        openChannel,
        toggleFavorite
      }}
    >
      {children}
    </ArtistActionContext.Provider>
  )
};

type UADType =
  | "favorite"
  | "rating";

const updateUAD = async (
  artist_id: string,
  change: UADType,
  to: string | number | boolean
): Promise<boolean> => {
  if (typeof to == "boolean") {
    if (to) to = 1;
    else to = 0;
  }
  const data = await api("/uud", "POST", { target_id: artist_id, change, to, type: "artist" });
  if (data == false) return false;
  else return true;
};

export const useArtistAction = () => {
  const context = useContext(ArtistActionContext);
  if (!context) {
    throw new Error("useArtistAction can only be used with in an ArtistActionProvider")
  }
  return context
}
