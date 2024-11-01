import { SongType } from "@/lib/utils";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import axios from "axios";
import {
  DataTableFilterItemType,
  DataTableExtraDataType,
} from "@/components/ui/data-table";

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
    <div className="flex h-full justify-center gap-5 max-w-[100vw] border">
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
