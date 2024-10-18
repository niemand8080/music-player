import { SongType } from "@/lib/utils";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import axios from "axios";
import {
  DataTableFilterItemType,
  DataTableExtraDataType,
} from "@/components/ui/data-table";

// const sample: SongType = {
//   name: "Sample Song Title",
//   file_exists: true, // This Not
//   artist_track_id: "00000000", // This Not
//   artist_name: "Sample Artist Name",
//   album: null,
//   genres: null,
//   birth_date: 0,
//   duration: 132,
//   listen_time_seconds: 10028130,
//   added: 0,
//   track_id: "00000000", // This Not
//   last_played: 120981,
//   path: "Sample Song Title/Sample Song Title", // This Not
//   yt_link: "https://www.youtube.com",
//   img_url:
//     "https://niemand8080.de/db/images/Super%20Mario%20World%20Game%20Over%20LoFi%20Hip%20Hop%20Remix.png",
//   favorite: null, // Only Under condition
//   rating: null, // Only Under condition
//   i_last_played: null, // Only Under condition
//   skip_count: null, // Only Under condition
//   my_listen_time_seconds: null, // Only Under condition
//   added_to_library: null, // Only Under condition
// };

async function getData(): Promise<SongType[]> {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/songs"
    );
    return response.data;
  } catch (error) {
    console.error("Error: ", error);
    return [];
  }
}

const filters: DataTableFilterItemType[] = [
  { label: "Title", id: "name" },
  { label: "Artist", id: "artist_name" },
  { label: "Album", id: "album" },
  { label: "Genres", id: "genres" },
];

const labels: DataTableExtraDataType[] = [
  { label: "Title", id: "name" },
  { label: "Artist", id: "artist_name" },
  { label: "Album", id: "album" },
  { label: "Genres", id: "genres" },
  { label: "Duration", id: "duration" },
  { label: "Global List Time", id: "listen_time_seconds" },
  { label: "Added", id: "added" },
  { label: "Played", id: "last_played" },
  { label: "YT Link", id: "yt_link" },
  { label: "Favorite", id: "favorite", authorized: true },
  { label: "Rating", id: "rating", authorized: true },
  { label: "I Played", id: "i_last_played", authorized: true },
  { label: "Skipped", id: "skip_count", authorized: true },
  { label: "List Time", id: "my_listen_time_seconds", authorized: true },
];

export default async function Page() {
  const data = await getData();

  return (
    <div className="flex h-full justify-center gap-5">
      <div className="container mx-auto transition-all">
        <DataTable
          columns={columns}
          data={data}
          filters={filters}
          labels={labels}
        />
        <div className="h-20"></div>
      </div>
    </div>
  );
}
