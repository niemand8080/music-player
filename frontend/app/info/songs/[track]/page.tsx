import { api, SongType } from "@/lib/utils";

export default async function Page({
  params,
}: {
  params: Promise<{ track: string }>
}) {
  const track = (await params).track;
  const song = await api(`/get_song?t=${track}`)
  return <div><DisplaySong song={song} /></div>
}

const DisplaySong: React.FC<{ song: SongType }> = ({ song }) => {
  return (
    <div>{song.name}</div>
  )
}
