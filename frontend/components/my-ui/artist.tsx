import { ArtistType } from "@/lib/utils";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Copy, Youtube, StarOff, Star } from "lucide-react";
import { useUser } from "../provider/user-provider";
import { useCallback } from "react";
import { useArtistAction } from "../provider/artist-action-provider";

export const ArtistContext: React.FC<{
  artist: ArtistType;
  children: React.ReactNode;
  handleUpdate: (fn: (...params: any[]) => Promise<ArtistType>) => void;
}> = ({ artist, children, handleUpdate }) => {
  const { user, authorized } = useUser();
  const { copyArtistID, openChannel, toggleFavorite } = useArtistAction();
  const { favorite, channel_id } = artist;
  const disable = user == undefined || !authorized;

  const getClass = useCallback((state: boolean) => {
    return `${
      state
        ? "group-hover:text-destructive group-hover:fill-destructive"
        : "group-hover:text-primary group-hover:fill-primary"
    } transition-all duration-300`}, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          className="group flex gap-1"
          onClick={() => copyArtistID(artist)}
        >
          <Copy
            size={16}
            className={`group-hover:text-primary transition-all duration-300`}
          />
          <span>Copy Track</span>
        </ContextMenuItem>
        {channel_id != null && (
          <>
            <ContextMenuItem
              className="group flex gap-1"
              onClick={() => openChannel(artist)}
            >
              <Youtube
                size={16}
                className={`group-hover:text-primary transition-all duration-300`}
              />
              <span>Open in YT</span>
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          className="group flex gap-1"
          disabled={disable}
          onClick={() => handleUpdate(toggleFavorite)}
        >
          {favorite ? (
            <StarOff size={16} className={`${getClass(favorite || false)}`} />
          ) : (
            <Star size={16} className={`${getClass(favorite || false)}`} />
          )}
          <span>{favorite ? "Favorite Revoked" : "Mark Favorite"}</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

