import os
import shutil
import sys
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
VIDEOS_DIR = f"{ROOT_PATH}{os.environ.get('VIDEOS_DIR')}"
ENV_DIR = f"{ROOT_PATH}{os.environ.get('ENV_DIR')}"
DB_FILE = f"{ENV_DIR}/data/music.db"

def advanced_print(msg: str, goal: int, current: int):
  terminal_width = shutil.get_terminal_size().columns
  max_name_length = terminal_width - 15
  displayed_msg = (msg[:max_name_length-3] + "...") if len(msg) > max_name_length else msg
  progress_msg = f"({current}/{goal}) -> {displayed_msg}"
  print(f"{progress_msg:<{terminal_width}}", end='\r')
  sys.stdout.flush()
  sys.stdout.write("\033[K")

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
              return True
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

async def update_db():
  print("\033[36mWrite media to DB\033[0m")
  artists = {a.name: a.artist_id for a in await sql("SELECT * FROM artists", fetch_results=True)}
  artist_ids = [a.artist_id for a in await sql("SELECT * FROM artists", fetch_results=True)]
  count = 0
  for root, _, files in os.walk(VIDEOS_DIR):
    file_count = len([1 for f in files if not f.startswith('.') and f.endswith('.mp4')])
    for file in files:
      if file.startswith('.') or not file.endswith('.mp4'):
        continue
      count += 1

      advanced_print(f"getting track: {file}", file_count, count)

      file_path = os.path.join(root, file)
      comment = getMetadata(file_path, "comment")
      yt_link = ''.join(comment.split('yt:')).split(';')[0]
      track = comment.split('track:')[1]

      # Check if a media with the track exists and continue if it does
      if await sql("SELECT 1 FROM media m INNER JOIN media_data md ON md.track_id = m.track_id WHERE m.track_id = ?", [track], fetch_success=True):
        continue
      
      advanced_print(f"insert media : {file}", file_count, count)
      artist = getMetadata(file_path, "artist")
      artist_id = artists.get(artist)

      # Create artist if not exists
      if artist_id == None:
        artist_id = f"a{generateUID(artist, artist_ids)}"
        artist_ids.append(artist_id)
        artists[artist] = artist_id
        await sql("INSERT INTO artists (name, artist_id) VALUES (?, ?)", [artist, artist_id])
        print(f"Artist \033[34m{artist}\033[0m added: \033[33m{artist_id}\033[0m")

      title = getMetadata(file_path, "title")
      date = getMetadata(file_path, "date")
      duration = getMetadata(file_path, "duration", "")
      added = round(time.time() * 1000)
      rel_path = os.path.basename(file)
      tags = ""

      await sql("""
        INSERT or IGNORE INTO media
        (name, artist_id, yt_link, date, track_id, duration, added, rel_path, type)
        VALUES (?,?,?,?,?,?,?,?,?)
      """, [title, artist_id, yt_link, date, track, duration, added, rel_path, "v"])

      await sql("""
        INSERT INTO media_data
        (name, artist_id, track_id, tags, type)
        VALUES (?, ?, ?, ?, ?)
      """, [title, artist_id, track, tags, "v"])

      print(f"Media \033[34m{title}\033[0m added: \033[33m{track}\033[0m")
  count = 0
  for root, _, files in os.walk(MUSIC_DIR):
    file_count = len([1 for file in files if not file.startswith('.') and file.endswith('.mp3')])
    for file in files:
      if file.startswith('.') or not file.endswith('.mp3'):
        continue
      
      count += 1
      advanced_print(f"getting track : {file}", file_count, count)

      file_path = os.path.join(root, file)
      track = getMetadata(file_path, "track")
        
      # Check if a media with the track exists and continue if it does
      if await sql("SELECT 1 FROM media m INNER JOIN media_data md ON md.track_id = m.track_id WHERE m.track_id = ?", [track], fetch_success=True):
        continue

      advanced_print(f"insert into db: {file}", file_count, count)
      rel_path = os.path.basename(file)
      artist = getMetadata(file_path, "artist")
      artist_id = artists.get(artist)

      # Create artist if not exists
      if artist_id == None:
        artist_id = f"a{generateUID(artist, artist_ids)}"
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

      await sql("""
        INSERT or IGNORE INTO media
        (name, artist_id, yt_link, date, track_id, duration, added, rel_path, type)
        VALUES (?,?,?,?,?,?,?,?,?)
      """, [title, artist_id, comment, date, track, duration, added, rel_path, "s"])

      await sql("""
        INSERT or IGNORE INTO media_data
        (name, artist_id, track_id, tags, type)
        VALUES (?, ?, ?, ?, ?)
      """, [title, artist_id, track, tags, "s"])

      print(f"Media \033[34m{title}\033[0m added: \033[33m{track}\033[0m")

async def check_files():
  print("\033[36mCheck Files\033[0m")
  await sql("UPDATE media SET file_exists = 0")
  medias = await sql("SELECT * FROM media", fetch_results=True)
  where_track = []
  for media in medias:
    if media.type == "s":
      file_path = os.path.join(MUSIC_DIR, media.rel_path)
    elif media.type == "v":
      file_path = os.path.join(VIDEOS_DIR, media.rel_path)
    else:
      print(f"No type set for: {media.track_id}")
      continue
    file_exists = os.path.exists(file_path)
    if file_exists:
      where_track.append(f"track_id = '{media.track_id}'")

  await sql(f"UPDATE media SET file_exists = 1 WHERE {' OR '.join([track for track in where_track])}")

async def main():
  await update_db()
  await check_files()


if __name__ == "__main__":
  asyncio.run(main())
  print("\033[32mDone!\033[0m")