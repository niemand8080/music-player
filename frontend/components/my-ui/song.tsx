import { SongType } from "@/lib/utils";
import { useSongAction } from "../provider/song-action-provider";
import { useUser } from "../provider/user-provider";
import { useAudio } from "../provider/audio-provider";
import { Ellipsis, Library, ListEnd, ListStart, Star, StarOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export const SongOptions: React.FC<{ song: SongType }> = ({ song }) => {
  const { user, authorized } = useUser();
  const { toggleLibrary, toggleFavorite } = useSongAction();
  const { addLast, addNext } = useAudio();
  const { added_to_library, favorite } = song;
  const disable = user == undefined || !authorized;

  const getClass = (state: boolean) => `${state ? "group-hover:text-destructive group-hover:fill-destructive" : "group-hover:text-primary group-hover:fill-primary"} transition-all duration-300`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full my-auto">
          <Ellipsis size={24} className="rounded-full hover:text-primary transition-all duration-300 hover:bg-primary/10 p-0.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="group flex gap-1" onClick={() => addNext(song)}>
            <ListStart size={16} className={`group-hover:text-primary transition-all duration-300`} />
            <span>Play Next</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="group flex gap-1" onClick={() => addLast(song)}>
            <ListEnd size={16} className={`group-hover:text-primary transition-all duration-300`} />
            <span>Play Last</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="group flex gap-1" disabled={disable} onClick={() => toggleFavorite(song)}>
            {favorite ? <StarOff size={16} className={`${getClass(favorite || false)}`} /> : <Star size={16} className={`${getClass(favorite || false)}`} />}
            <span>{favorite ? "Favorite Revoked" : "Mark Favorite"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="group flex gap-1" disabled={disable} onClick={() => toggleLibrary(song)}>
            <Library size={16} className={`${getClass(added_to_library || false)}`} />
            <span>{added_to_library ? "Remove from" : "Add to"} Library</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
};