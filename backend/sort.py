import os
import time
import hashlib
import asyncio
import subprocess
from typing import List
import aiosqlite # type: ignore
from dotenv import load_dotenv # type: ignore
from collections import namedtuple

load_dotenv()

ROOT_PATH = os.environ.get("ROOT_PATH")
MUSIC_DIR = f"{ROOT_PATH}{os.environ.get('MUSIC_DIR')}"
ENV_DIR = f"{ROOT_PATH}{os.environ.get('ENV_DIR')}"
DB_FILE = f"{ENV_DIR}/data/music.db"
LINKS_FILE = f"{ROOT_PATH}{os.environ.get('LINKS_FILE')}"

async def sql(query: str, params=None, fetch_results=False, fetch_success=False, max_retries=5):
  for attempt in range(max_retries):
    try:
      async with aiosqlite.connect(DB_FILE) as connection:
        if fetch_results:
          connection.row_factory = aiosqlite.Row
        async with connection.execute(query, params) as cursor:
          if fetch_results:
            rows = await cursor.fetchall()
            columns = [description[0] for description in cursor.description]
            Result = namedtuple('Result', columns)
            results = [Result(**dict(row)) for row in rows]
          elif fetch_success:
            results = await cursor.fetchall()
            if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
              return await connection.commit()
            else:
              return bool(results)
          else:
            results = None
            await connection.commit()
        return results
    except aiosqlite.OperationalError as e:
      if "database is locked" in str(e) and attempt < max_retries - 1:
        wait_time = (attempt + 1) * 0.5  # Increase wait time with each attempt
        print(f"Database is locked. Retrying in {wait_time} seconds... (Attempt {attempt + 1}/{max_retries})")
        await asyncio.sleep(wait_time)
      else:
        print(f"Database error after {attempt + 1} attempts: {e}")
        print(f"Query: {query}")
        print(f"Parameters: {params}")
        if fetch_success:
          return False
        raise
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        print(f"Query: {query}")
        print(f"Parameters: {params}")
        if fetch_success:
            return False
        raise
  
  print(f"Failed to execute query after {max_retries} attempts")
  return False if fetch_success else None

def getMetadata(file_path: str, name: str, tag = "_tags"):
  return subprocess.run([
        'ffprobe',
        '-loglevel', 'error',
        '-show_entries',
        f'format{tag}={name}',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        file_path
      ], 
      stdout=subprocess.PIPE,
      text=True,
      check=False).stdout.strip()

def generateUID(input: str, existing: List[str]):
  count = 1
  uid = hashlib.sha256(input.encode()).hexdigest()[:8]
  while uid in existing:
    if count >= 56:
      uid = hashlib.sha256().hexdigest()[count:count+8]
    else:
      uid = hashlib.sha256(input.encode()).hexdigest()[count:count+8]
  
  return uid

async def write_db():
  print("\033[36mWrite songs to DB\033[0m")
  artists = {a.name: a.artist_id for a in await sql("SELECT * FROM artists", fetch_results=True)}
  artist_ids = [a.artist_id for a in await sql("SELECT * FROM artists", fetch_results=True)]
  for root, _, files in os.walk(MUSIC_DIR):
    for file in files:
      if file.startswith('.'):
        continue
        
      file_path = os.path.join(root, file)
      track = getMetadata(file_path, "track")

      # Check if a song with the track exists and continue if it does
      if await sql("SELECT 1 FROM songs s INNER JOIN songs_data sd ON sd.track_id = s.track_id WHERE s.track_id = ?", [track], fetch_success=True):
        continue
      
      artist = getMetadata(file_path, "artist")
      artist_id = artists.get(artist)

      # Create artist if not exists
      if artist_id == None:
        artist_id = generateUID(artist, artist_ids)
        artist_ids.append(artist_id)
        artists[artist] = artist_id
        await sql("INSERT INTO artists (name, artist_id) VALUES (?, ?)", [artist, artist_id])
        print(f"Artist \033[34m{artist}\033[0m added: \033[33m{artist_id}\033[0m")

      title = getMetadata(file_path, "title")
      comment = getMetadata(file_path, "comment")
      date = getMetadata(file_path, "date")
      duration = getMetadata(file_path, "duration", "")
      added = round(time.time() * 1000)
      rel_path = os.path.basename(file)
      tags = ""

      if artist == "Suno":
        tags = "AI Generated"
      else:
        f = open(LINKS_FILE, "a")
        f.write(f"\n{comment}")
        f.close()

      await sql("""
        INSERT or IGNORE INTO songs
        (name, artist_id, yt_link, date, track_id, duration, added, rel_path)
        VALUES (?,?,?,?,?,?,?,?)
      """, [title, artist_id, comment, date, track, duration, added, rel_path])

      await sql("""
        INSERT INTO songs_data
        (name, artist_id, track_id, tags)
        VALUES (?, ?, ?, ?)
      """, [title, artist_id, track, tags])

      print(f"Song \033[34m{title}\033[0m added: \033[33m{track}\033[0m")

async def check_db():
  print("\033[36mCheck DB\033[0m")
  await sql("UPDATE songs SET file_exists = 0")
  songs = await sql("SELECT * FROM songs", fetch_results=True)
  where_track = []
  for song in songs:
    file_path = os.path.join(MUSIC_DIR, song.rel_path)
    file_exists = os.path.exists(file_path)
    if file_exists:
      where_track.append(f"track_id = '{song.track_id}'")

  await sql(f"UPDATE songs SET file_exists = 1 WHERE {' OR '.join([track for track in where_track])}")

async def main():
  await write_db()
  await check_db()


if __name__ == "__main__":
  asyncio.run(main())
  print("\033[32mDone!\033[0m")