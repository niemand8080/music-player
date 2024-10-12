import os
import time
import hashlib
import asyncio
from typing import Optional
from dataclasses import dataclass
from typing import Optional, List
from collections import namedtuple
import aiosqlite # type: ignore
from mutagen import File # type: ignore
from flask_cors import CORS # type: ignore
from dotenv import load_dotenv # type: ignore
from flask_executor import Executor # type: ignore
from flask import Flask, send_file, abort, request, jsonify # type: ignore

# Load environment variables from .env file
load_dotenv()

# TODO import playlists from YT / Kina 
# TODO Von überall Access
# TODO Cover für jeden Song/artist mit KI
# TODO Genre für jeden Song
# TODO Global Playlists (z.B. Relax, Wohlfühlen)

# TODO Anime intros etc.
# TODO Eminem (Bornana)
# TODO Pmac - One: https://www.youtube.com/watch?v=lLJyOMcFYeA

app = Flask(__name__)
executor = Executor(app)
# CORS(app)
IP_ADDRESS = os.environ.get('IP_ADDRESS')
CORS(app, resources={r"/api/*": { "origins": f"http://{IP_ADDRESS if IP_ADDRESS else 'localhost'}:3000" }})

ROOT_PATH = os.environ.get("ROOT_PATH")
ENV_DIR = f"{ROOT_PATH}{os.environ.get('ENV_DIR')}"
MUSIC_DIR = f"{ROOT_PATH}{os.environ.get('MUSIC_DIR')}"
DB_FILE = f"{ENV_DIR}/data/data.db"

print(ROOT_PATH)
print(ENV_DIR)
print(MUSIC_DIR)
print(DB_FILE)

##C ----------------------------CLASSES----------------------------
# region
@dataclass
class Artist:
    id: Optional[int] = None
    name: str = ""
    artist_track_id: str = ""

@dataclass
class Song:
    id: Optional[int] = None
    file_exists: bool = True
    name: str = ""
    artist_track_id: Optional[str] = None
    artist_name: Optional[str] = None
    album: Optional[str] = None
    genres: Optional[List[str]] = None
    birth_date: Optional[int] = None
    duration: Optional[int] = None
    global_played: int = 0
    added: Optional[int] = None
    track_id: str = ""
    last_played: Optional[int] = None
    rel_path: Optional[str] = None
    yt_link: Optional[str] = None

    def __post_init__(self):
        if isinstance(self.genres, str):
            self.genres = self.genres.split(',')
        elif self.genres is None:
            self.genres = []
        
        if isinstance(self.file_exists, int):
            self.file_exists = bool(self.file_exists)
# endregion
##C ----------------------------CLASSES----------------------------

##A ------------------------------API------------------------------
# region
@app.route('/api/ping')
def pong():
  return "pong"

@app.route('/api/search')
async def search_in_db():
    query: Optional[str] = request.args.get('q')
    if query is None:
        query = ""
    query = query.lower()
    limit: int = int(request.args.get('limit', 100))
    pattern = f"%{'%'.join(query)}%"
    sql_query = """
        SELECT
            s.file_exists,
            s.name,
            s.birth_date,
            s.duration,
            s.added,
            s.rel_path as path,
            s.track_id,
            s.yt_link,
            sd.artist_track_id,
            sd.album,
            sd.genres,
            sd.global_played,
            sd.last_played,
            a.name as artist_name
        FROM songs s
        LEFT JOIN songs_data sd ON sd.track_id = s.track_id
        LEFT JOIN artists a ON a.artist_track_id = sd.artist_track_id
        WHERE LOWER(s.name) LIKE ? 
           OR LOWER(a.name) LIKE ? 
           OR s.track_id = ?
        ORDER BY sd.global_played DESC, s.added DESC
        LIMIT ?
    """
    
    # Execute the query using your custom sql function
    songs = await sql(sql_query, [pattern, pattern, query, limit], fetch_results=True)
    
    result: List[Song] = format_namedtuple(songs)
    return jsonify(result)

@app.route('/api/client_browser')
def client_browser():
    return jsonify({ "browser": get_client_browser() })

@app.route('/api/songs')
async def get_songs():
	max_amount = get_max_amount()

	songs = await sql("""
        SELECT 
            s.file_exists,
            s.name,
            s.birth_date,
            s.duration,
            s.added,
            s.rel_path as path,
            s.track_id,
            s.yt_link,
            sd.artist_track_id,
            sd.album,
            sd.genres,
            sd.global_played,
            sd.last_played,
            a.name as artist_name
        FROM songs s
        LEFT JOIN songs_data sd ON sd.track_id = s.track_id
        LEFT JOIN artists a ON a.artist_track_id = sd.artist_track_id
        ORDER BY RANDOM()
    """, fetch_results=True)

	result: List[Song] = format_namedtuple(songs)
	
	return jsonify(result[:max_amount])

@app.route('/api/play')
async def play_song():
    track_id = request.args.get('t')
    if track_id is None:
      track_id = "00000000"
    
    try:
        songs = await sql("SELECT * FROM songs WHERE track_id = ?", [track_id], fetch_results=True)
        song = format_namedtuple(songs)

        if not song[0]["rel_path"]:
            return { "error": "no path found" }, 404
        
        full_path = os.path.join(MUSIC_DIR, song[0]["rel_path"])
        if not os.path.exists(full_path):
            app.logger.error(f"File not found: {full_path}")
            abort(404)
        
        client_browser = get_client_browser()
        mimetype = "audio/mpeg" if client_browser == "Safari" else 'audio/opus'
        return send_file(full_path, mimetype=mimetype, as_attachment=False)
    except Exception as e:
        app.logger.error(f"Error serving {track_id}: {str(e)}")
        abort(500)
# endregion
##A ------------------------------API------------------------------

##F ---------------------------FUNCTIONS---------------------------
# region
def get_max_amount() -> int:
	max_amount_str: Optional[str] = request.args.get('a')

	if max_amount_str is None:
		return -1

	try:
		max_amount = int(max_amount_str)
		return max_amount if max_amount >= 0 else -1
	except ValueError:
		return -1

def format_namedtuple(songs):
    return [
        {
            field: getattr(song, field)
            for field in song._fields
        }
        for song in songs
    ]

def get_client_browser() -> str:
    user_agent = request.headers.get('User-Agent')
    if 'Chrome' in user_agent and 'Safari' in user_agent:
        return 'Chrome'
    elif 'Safari' in user_agent:
        return 'Safari'
    elif 'Firefox' in user_agent:
        return 'Firefox'
    else:
        return 'Unknown'

async def sql(query, params=None, fetch_results=False, fetch_success=False, max_retries=5):
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
# endregion
##F ---------------------------FUNCTIONS---------------------------

##S -----------------------------SETUP-----------------------------
# region
##D --------------------DATA BASE--------------------
# region
async def sync_songs_with_db(songs):
    artist_list = await sql('SELECT * FROM artists', fetch_results=True)
    artists = { artist.name: artist.artist_track_id for artist in artist_list }
    track_ids = [artist.artist_track_id for artist in artist_list]
    
    async def insert_song(song):
        if await sql("SELECT 1 FROM songs s INNER JOIN songs_data sd ON sd.track_id = s.track_id WHERE s.name = ? AND s.track_id = ?", [song["name"], song["track_id"]], fetch_success=True):
            return False
        
        artist_name = song["artist_name"]
        if artist_name and artist_name not in artists:
            count = 0
            artist_track_id = hashlib.sha256(str(artist_name).encode()).hexdigest()[count:count+8]
            while artist_track_id in track_ids:
                count += 1
                old_id = artist_track_id
                artist_track_id = hashlib.sha256(str(artist_name).encode()).hexdigest()[count:count+8]
                print(f"\033[34m{artist_name}\033[0m track_id found and changed: \033[31m{old_id}\033[0m -> \033[32m{artist_track_id}\033[0m")

            await sql('INSERT or IGNORE INTO artists (name, artist_track_id) VALUES (?,?)', [artist_name, artist_track_id])
            print(f"Created new \033[34mArtist\033[0m: \033[36m{artist_name}\033[0m - \033[32m{artist_track_id}\033[0m")
            artists[artist_name] = artist_track_id
            track_ids.append(artist_track_id)
        else:
            artist_track_id = artists.get(artist_name, "00000000")

        song_data = [
            song["name"], 1, artist_track_id, artist_name, song.get("album"), song.get("genres"),
            song["birth_date"], song["duration"], 0, time.time(), song["track_id"], None,
            song["path"], song["yt_link"]
        ]

        try:
            await sql("""
                INSERT or IGNORE INTO songs
                (name, file_exists, o_artist_name, birth_date, duration, added, rel_path, track_id, yt_link)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [song["name"], 1, artist_name, song["birth_date"], song["duration"], time.time(), song["path"], song["track_id"], song["yt_link"]])
            await sql("""
                INSERT INTO songs_data
                (name, artist_track_id, album, genres, global_played, last_played, track_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, [song["name"], artist_track_id, song.get("album"), song.get("genres"), 0, 0, song["track_id"]])
            print(f"Created new \033[33mSong\033[0m: \033[35m{song_data[0]}\033[0m")
        except Exception as e:
            print(f"Error inserting song: {e}")
            return False
        return True

    tasks = [insert_song(song) for song in songs]
    results = await asyncio.gather(*tasks)
    
    inserted_count = sum(results)
    print(f"Inserted \033[32m{inserted_count}\033[0m new songs out of \033[35m{len(songs)}\033[0m total songs.")

async def get_song_data(root: str, file: str) -> Song:
    name, _ = os.path.splitext(file)
    full_path = os.path.join(root, file)
    audio = File(full_path)
    if audio is None:
        print(f"\033[31maudio is none: \033[0m{name}")
        return None

    # Extract metadata from file
    track_id = audio.tags.get('TRACKNUMBER', [''])[0]
    if track_id == "":
        track_id = hashlib.sha256(str(name).encode()).hexdigest()[:8];
    artist_name = audio.tags.get('ARTIST', [''])[0]
    yt_link = audio.tags.get('YT_LINK', [''])[0]
    birth_date = int(audio.tags.get('BIRTHDATE', [0])[0])
    duration = audio.info.length

    # Check if song exists in database
    song = await sql("""
        SELECT 
            s.file_exists,
            s.name,
            s.birth_date,
            s.duration,
            s.added,
            s.rel_path,
            s.track_id,
            s.yt_link,
            sd.artist_track_id,
            sd.album,
            sd.genres,
            sd.global_played,
            sd.last_played,
            a.name as artist_name
        FROM songs s
        LEFT JOIN songs_data sd ON sd.track_id = s.track_id
        LEFT JOIN artists a ON a.artist_track_id = sd.artist_track_id
        WHERE s.name = ? AND s.track_id = ?
    """, [name, track_id], fetch_results=True)
    song = song[0] if song else None

    relative_path = os.path.relpath(full_path, MUSIC_DIR)
    
    song_data: Song = {
        "name": name,
        "file_exists": 1,
        "artist_track_id": song.artist_track_id if song else "",
        "artist_name": artist_name or (song.artist_name if song else ""),
        "album": audio.tags.get('ALBUM', [''])[0] or (song.album if song else ""),
        "genres": audio.tags.get('GENRE', [''])[0] or (song.genres if song else ""),
        "birth_date": birth_date or (song.birth_date if song else 0),
        "duration": duration or (song.duration if song else 0),
        "global_played": song.global_played if song else 0,
        "added": song.added if song else time.time(),
        "track_id": track_id,
        "last_played": song.last_played if song else None,
        "path": (song.rel_path if song else relative_path),
        "yt_link": yt_link or (song.yt_link if song else ""),
    }

    return song_data

async def sync_all_songs_with_db():
    print("Start syncing DB with files")
    await sql("UPDATE songs SET file_exists = 0")

    opus_files = []
    for root, _, files in os.walk(MUSIC_DIR):
        opus_files.extend([os.path.join(root, file) for file in files if file.endswith('.opus') and not file.startswith(".")])

    batch_size = 100
    all_songs = []
    track_ids_to_update = set()

    for i in range(0, len(opus_files), batch_size):
        batch = opus_files[i:i+batch_size]
        song_data_coros = [get_song_data(os.path.dirname(file), os.path.basename(file)) for file in batch]
        songs = await asyncio.gather(*song_data_coros)
        
        all_songs.extend([song for song in songs if song is not None])
        track_ids_to_update.update(song['track_id'] for song in songs if song is not None)
        
        if len(all_songs) >= batch_size:
            await sync_songs_with_db(all_songs)
            all_songs = []
    
    if all_songs:
        await sync_songs_with_db(all_songs)

    if track_ids_to_update:
        placeholders = ','.join('?' * len(track_ids_to_update))
        query = f"UPDATE songs SET file_exists = 1 WHERE track_id IN ({placeholders})"
        await sql(query, list(track_ids_to_update))

    print(f"Processed \033[32m{len(opus_files)}\033[0m files")

async def init_db():
    print("Initializing db")
    try:
        # Create songs table
        await sql("""
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            file_exists INTEGER DEFAULT 1,
            o_artist_name TEXT,
            birth_date INTEGER,
            duration INTEGER,
            added INTEGER,
            rel_path TEXT,
            track_id TEXT UNIQUE,
            yt_link TEXT
        );
        """)
        
        # Create songs_data table
        await sql("""
        CREATE TABLE IF NOT EXISTS songs_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            artist_track_id TEXT,
            album TEXT,
            genres TEXT,
            global_played INTEGER DEFAULT 0,
            last_played INTEGER DEFAULT 0,
            track_id TEXT UNIQUE,
            FOREIGN KEY (artist_track_id) REFERENCES artists(artist_track_id),
            FOREIGN KEY (track_id) REFERENCES songs(track_id)
        );
        """)
        
        # Create artists table
        await sql("""
        CREATE TABLE IF NOT EXISTS artists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            artist_track_id TEXT UNIQUE NOT NULL
        );
        """)

        await sql("""
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at INTEGER,
            last_login INTEGER
        );
        """)

        await sql("""
        CREATE TABLE IF NOT EXISTS user_song_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            track_id TEXT NOT NULL,
            played_count INTEGER DEFAULT 0,
            favorite INTEGER DEFAULT 0,
            rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
            last_played INTEGER,
            skip_count INTEGER DEFAULT 0,
            added_to_playlist_count INTEGER DEFAULT 0,
            first_played INTEGER,
            added_to_library INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES user(id),
            FOREIGN KEY (track_id) REFERENCES songs(track_id),
            UNIQUE (user_id, track_id)
        );
        """)

        await sql("""
        CREATE TABLE IF NOT EXISTS user_song_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            track_id TEXT NOT NULL,
            played_count INTEGER DEFAULT 0,
            skipped_count INTEGER DEFAULT 0,
            listen_time_seconds INTEGER DEFAULT 0,
            date INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user(id),
            FOREIGN KEY (track_id) REFERENCES songs(track_id)
        );
        """)

        await sql("CREATE INDEX IF NOT EXISTS idx_songs_track_id ON songs(track_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_songs_data_track_id ON songs_data(track_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_artists_artist_track_id ON artists(artist_track_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_data_user_id ON user_song_data(user_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_data_track_id ON user_song_data(track_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_history_user_id ON user_song_history(user_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_history_track_id ON user_song_history(track_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_history_date ON user_song_history(date);")
        
        print("Database initialization completed successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise


# endregion
##D --------------------DATA BASE--------------------
# endregion
##S -----------------------------SETUP-----------------------------

##M -----------------------------MAIN------------------------------
# region
async def main():
    await init_db()
    await sync_all_songs_with_db()

if __name__ == '__main__':
    asyncio.run(main())
    try:
        app.run(host='0.0.0.0', port=8000, debug=True)
    finally:
        print("Bye...")
# endregion
##M -----------------------------MAIN------------------------------