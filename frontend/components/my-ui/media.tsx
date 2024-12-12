import { MediaType } from "@/lib/utils";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Copy, Youtube, ListStart, ListEnd, StarOff, Star, Library } from "lucide-react";
import { useAudio } from "../provider/audio-provider";
import { useMediaAction } from "../provider/media-action-provider";
import { useUser } from "../provider/user-provider";
import { useCallback } from "react";

export const MediaContext: React.FC<{
  media: MediaType;
  children: React.ReactNode;
  handleUpdate: (fn: (...params: any[]) => Promise<MediaType>) => void;
}> = ({ media, children, handleUpdate }) => {
  const { user, authorized } = useUser();
  const { toggleLibrary, toggleFavorite, copyTrack } = useMediaAction();
  const { addLast, addNext } = useAudio();
  const { added_to_library, favorite, yt_link, type } = media;
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
          onClick={() => copyTrack(media)}
        >
          <Copy
            size={16}
            className={`group-hover:text-primary transition-all duration-300`}
          />
          <span>Copy Track</span>
        </ContextMenuItem>
        {yt_link != null && (
          <>
            <ContextMenuItem
              className="group flex gap-1"
              onClick={() => window.open(yt_link, "_blank")}
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
        {type == "s" && (
          <>
            <ContextMenuItem
              className="group flex gap-1"
              onClick={() => addNext(media)}
            >
              <ListStart
                size={16}
                className={`group-hover:text-primary transition-all duration-300`}
              />
              <span>Play Next</span>
            </ContextMenuItem>
            <ContextMenuItem
              className="group flex gap-1"
              onClick={() => addLast(media)}
            >
              <ListEnd
                size={16}
                className={`group-hover:text-primary transition-all duration-300`}
              />
              <span>Play Last</span>
            </ContextMenuItem>
          <ContextMenuSeparator />
          </>
        )}
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
        <ContextMenuItem
          className="group flex gap-1"
          disabled={disable}
          onClick={() => handleUpdate(toggleLibrary)}
        >
          <Library
            size={16}
            className={`${getClass(added_to_library || false)}`}
          />
          <span>{added_to_library ? "Remove from" : "Add to"} Library</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
