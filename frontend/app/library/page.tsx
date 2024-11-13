"use client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import axios from "axios";
import {
  DataTableFilterItemType,
  DataTableExtraDataType,
} from "@/app/library/data-table";
import { useEffect, useState } from "react";
import { useUser } from "@/components/provider/user-provider";
import { api } from "@/lib/utils";

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

export default function Page() {
  const { user, authorized } = useUser();
  const [data, setData] = useState([]);

  const getData = async () => {
    setData(await api("/songs"))
  };

  useEffect(() => {
    // alert("Implement TanStack Table:\nhttps://tanstack.com/table/latest/docs/guide/column-ordering")
    getData();
  }, [user]);

  if (authorized == undefined) return;

  return (
    <div className="flex h-full justify-center gap-5 max-w-[100vw]">
      <div className="container mx-auto transition-all">
        <DataTable
          columns={columns}
          data={data}
          filters={filters}
          labels={labels}
          logged_in={!!user}
        />
        <div className="h-20"></div>
      </div>
    </div>
  );
}
