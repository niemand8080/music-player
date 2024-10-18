"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";

import { SongType, formatTime } from "@/lib/utils";
import { UserStarRating, UserStar } from "@/components/my-ui/user";
import { DataTableColumnHeader } from "@/components/ui/data-table";

export const columns: ColumnDef<SongType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Title" />;
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <span className="truncate">{name}</span>;
    },
  },
  {
    accessorKey: "artist_name",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Artist" />;
    },
    cell: ({ row }) => {
      const artist_name = row.getValue("artist_name") as string | null;
      const artistName = artist_name ? (
        artist_name
      ) : (
        <span className="text-secondary-foreground">None</span>
      );

      return <div className="font-medium truncate">{artistName}</div>;
    },
  },
  {
    accessorKey: "album",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Album" hidden />;
    },
    cell: ({ row }) => {
      const album = row.getValue("album") as string | null;
      const albumName = album ? (
        album
      ) : (
        <span className="text-secondary-foreground">None</span>
      );

      return <div className="font-medium">{albumName}</div>;
    },
  },
  {
    accessorKey: "genres",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Genres" hidden />;
    },
    cell: ({ row }) => {
      const genres = row.getValue("genres") as string | null;
      const genresName = genres ? (
        genres
      ) : (
        <span className="text-secondary-foreground">None</span>
      );

      return <div className="font-medium">{genresName}</div>;
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Duration" />;
    },
    cell: ({ row }) => {
      const duration = parseFloat(row.getValue("duration"));
      const formatted = formatTime(duration);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "listen_time_seconds",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          column={column}
          title="Global Listen Time"
          hidden
        />
      );
    },
    cell: ({ row }) => {
      const listen_time_seconds = parseFloat(
        row.getValue("listen_time_seconds")
      );
      const formatted = formatTime(listen_time_seconds, "listen_time");

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "added",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Added" hidden />;
    },
    cell: ({ row }) => {
      const added = parseFloat(row.getValue("added"));
      const formatted = new Date(added).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        day: "numeric",
      });

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "last_played",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Played" />;
    },
    cell: ({ row }) => {
      const last_played = parseFloat(row.getValue("last_played"));
      const formatted = formatTime(last_played, "ago");

      return (
        <div className="font-medium">
          {last_played ? (
            formatted
          ) : (
            <span className="text-secondary-foreground">Never</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "yt_link",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="YT link" />;
    },
    cell: ({ row }) => {
      const yt_link = row.getValue("yt_link") as string | null;
      const text = yt_link ? (
        "YouTube"
      ) : (
        <span className="text-secondary-foreground no-underline">None</span>
      );

      return (
        <>
          {yt_link ? (
            <a
              href={yt_link || ""}
              target="_blank"
              className={`${
                yt_link && "hover:underline"
              } font-medium text-primary`}
            >
              {text}
            </a>
          ) : (
            text
          )}
        </>
      );
    },
  },
  {
    accessorKey: "favorite",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="" authorized>
          <Star size={16} className="text-primary" />
        </DataTableColumnHeader>
      );
    },
    cell: ({ row }) => {
      const song = row.original;

      return <UserStar song={song} />;
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Rating" authorized />
      );
    },
    cell: ({ row }) => {
      const song = row.original;

      return <UserStarRating song={song} />;
    },
  },
  {
    accessorKey: "i_last_played",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="I Played" authorized />
      );
    },
    cell: ({ row }) => {
      const i_last_played = parseFloat(row.getValue("i_last_played"));
      const formatted = formatTime(i_last_played, "ago");

      return (
        <div className="font-medium">
          {i_last_played ? (
            formatted
          ) : (
            <span className="text-secondary-foreground">Never</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "skip_count",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Skipped" hidden />;
    },
    cell: ({ row }) => {
      const skip_count = parseFloat(row.getValue("skip_count"));

      return (
        <div className="font-medium">
          {skip_count ? (
            `${skip_count} times`
          ) : (
            <span className="text-secondary-foreground">Never</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "my_listen_time_seconds",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          column={column}
          title="My Listen Time"
          authorized
        />
      );
    },
    cell: ({ row }) => {
      const my_listen_time_seconds = parseFloat(
        row.getValue("my_listen_time_seconds")
      );
      const formatted = formatTime(my_listen_time_seconds, "listen_time");

      return (
        <div className="font-medium">
          {my_listen_time_seconds ? (
            formatted
          ) : (
            <span className="text-secondary-foreground">0s</span>
          )}
        </div>
      );
    },
  },
];
