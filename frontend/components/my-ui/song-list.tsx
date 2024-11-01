"use client";
import React from "react";
import { SongType, formatTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const SongList: React.FC<{ songs: SongType[] }> = ({ songs }) => {
  return (
    <div>
      <SongTable songs={songs} />
    </div>
  );
};

export const SongTable: React.FC<{ songs: SongType[] }> = ({ songs }) => {
  const formatDate = (time: number): string =>
    new Date(time).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  const sum = songs.length > 0 ? songs.map((s) => s.duration).reduce((a, b) => a + b) : 0;
  return (
    <Table>
      <TableCaption>{songs.length} Songs {formatTime(sum)}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Artist</TableHead>
          <TableHead>Album</TableHead>
          <TableHead>Genre</TableHead>
          <TableHead className="text-right">Added</TableHead>
          <TableHead>Last Time Played</TableHead>
          <TableHead>YT Link</TableHead>
          <TableHead className="text-right">Duration</TableHead>
          <TableHead className="text-right">Played</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {songs.map((song, index) => (
          <TableRow key={index}>
            <TableCell className="border-r">{song.name}</TableCell>
            <TableCell className="border-r">{song.artist_name}</TableCell>
            <TableCell className="border-r">{song.album || (<span className="text-secondary-foreground">None</span>)}</TableCell>
            <TableCell className="border-r">{song.genre || (<span className="text-secondary-foreground">None</span>)}</TableCell>
            <TableCell className="text-right">{formatDate(song.added)}</TableCell>
            <TableCell className="border-r">{song.last_played || (<span className="text-secondary-foreground">Never Played</span>)}</TableCell>
            <TableCell className="border-r">{song.yt_link || (<span className="text-secondary-foreground">None</span>)}</TableCell>
            <TableCell className="text-right">{formatTime(song.duration)}</TableCell>
            <TableCell className="text-right">{song.listen_time_seconds}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export const SongCard: React.FC<{ song: SongType }> = ({ song }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold truncate">
          {song.name}
        </CardTitle>
        <p className="text-sm truncate">{song.artist_name}</p>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
};
