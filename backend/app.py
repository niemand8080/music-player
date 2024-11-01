import os
import re
import time
import random 
import string
import secrets
import hashlib
import asyncio
import logging
from typing import Optional, List
from collections import namedtuple
from typing import Optional, Literal
from email.mime.text import MIMEText # send mail
from email.mime.multipart import MIMEMultipart # send mail
import bcrypt # type: ignore
import aiosqlite # type: ignore
import aiosmtplib # type: ignore
from mutagen import File # type: ignore
from flask_cors import CORS # type: ignore
from dotenv import load_dotenv # type: ignore
from flask_executor import Executor # type: ignore
from flask import Flask, send_file, abort, request, jsonify, make_response # type: ignore

# Load environment variables from .env file
load_dotenv()

''' Suno API
https://aimlapi.com/app/keys
https://aimlapi.com/suno-ai-api
'''

# TODO import playlists from YT / Kina 
# TODO Access everywhere
# TODO Cover for each Song/artist mit KI
# TODO Global Playlists (z.B. Relax, Wohlfühlen)

# TODO Anime intros etc.
# TODO Eminem (Bornana)
# TODO Pmac - One: https://www.youtube.com/watch?v=lLJyOMcFYeA

app = Flask(__name__)
executor = Executor(app)
# CORS(app)
IP_ADDRESS = os.environ.get('IP_ADDRESS')
CORS(app, resources={r"/api/*": { "origins": f"https://{IP_ADDRESS if IP_ADDRESS else 'localhost'}:3000", "supports_credentials": True }})

ROOT_PATH = os.environ.get("ROOT_PATH")
ENV_DIR = f"{ROOT_PATH}{os.environ.get('ENV_DIR')}"
MUSIC_DIR = f"{ROOT_PATH}{os.environ.get('MUSIC_DIR')}"
DB_FILE = f"{ENV_DIR}/data/data.db"

GMAIL=os.environ.get('GMAIL')
GMAIL_PASSWORD=os.environ.get('GMAIL_PASSWORD')

##L -------------------------CUSTOM LOGGER-------------------------
class CustomFormatter(logging.Formatter):
    grey = "\x1b[38;20m"
    blue = "\x1b[34;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format = "(%(filename)s:%(lineno)d) %(asctime)s - %(levelname)s - %(message)s" # %(name)s

    FORMATS = {
        logging.DEBUG: grey + format + reset,
        logging.INFO: blue + format + reset,
        logging.WARNING: yellow + format + reset,
        logging.ERROR: red + format + reset,
        logging.CRITICAL: bold_red + format + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)

# create logger with 'spam_application'
logger = logging.getLogger("app")
logger.setLevel(logging.DEBUG)

# create console handler with a higher log level
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)

ch.setFormatter(CustomFormatter())

logger.addHandler(ch)
##L -------------------------CUSTOM LOGGER-------------------------

##M -----------------------------MUSIC-----------------------------
# TODO
@app.route('/api/search', methods=['GET'])
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
            sd.genre,
            sd.tags,
            sd.listen_time_seconds,
            sd.last_played,
            sd.img_url,
            a.name as artist_name
        FROM songs s
        LEFT JOIN songs_data sd ON sd.track_id = s.track_id
        LEFT JOIN artists a ON a.artist_track_id = sd.artist_track_id
        WHERE LOWER(s.name) LIKE ? 
            OR LOWER(a.name) LIKE ? 
            OR s.track_id = ?
        ORDER BY sd.listen_time_seconds DESC, s.added DESC
        LIMIT ?
    """
    
    # Execute the query using your custom sql function
    songs = await sql(sql_query, [pattern, pattern, query, limit], fetch_results=True)
    
    result = format_namedtuple(songs)
    return jsonify(result)

@app.route('/api/songs', methods=['GET'])
async def get_songs():
    token = request.cookies.get('session_token')
    max_amount = get_max_amount()
    logger.info(f"Token: {token}")

    songs = await get_all_songs(token)

    result = format_namedtuple(songs)
	
    return jsonify(result[:max_amount])

@app.route('/api/play')
async def play_song():
    track_id = request.args.get('t')
    token = request.cookies.get('session_token')

    if track_id is None:
        track_id = "00000000"
    
    try:
        songs = await sql("SELECT * FROM songs WHERE track_id = ?", [track_id], fetch_results=True)
        song = format_namedtuple(songs)

        if not song[0]["rel_path"]:
            return { "error": "no path found" }, 404
        
        full_path = os.path.join(MUSIC_DIR, song[0]["rel_path"])
        if not os.path.exists(full_path):
            logger.error(f"File not found: {full_path}")
            abort(404)
        
        client_browser = get_client_browser()
        mimetype = "audio/mpeg" if client_browser == "Safari" else 'audio/opus'

        await sql("UPDATE songs_data SET last_played = ? WHERE track_id = ?", [get_time(), track_id])

        if token is not None:
            await update_usd(token, track_id, "last_played", get_time())

        return send_file(full_path, mimetype=mimetype, as_attachment=False)
    except Exception as e:
        logger.error(f"Error serving {track_id}: {str(e)}")
        abort(500)
##M -----------------------------MUSIC-----------------------------

##D --------------------------USER MUSIC---------------------------
@app.route('/api/uusd', methods=['POST'])
async def uusd():
    data = request.json
    token = request.cookies.get('session_token')
    track_id = data.get('track_id')
    change = data.get('change')
    to = data.get('to')

    updated = await update_usd(token, track_id, change, to)

    if updated:
        return jsonify({ "success": True , "message": "Successfully Changed user specific data" })
    else:
        return jsonify({ "success": False , "error": "Not Authorized" })

# usd is user song data
USDType = Literal["last_played", "listen_time_seconds", "favorite", "rating", "skip_count", "first_played", "added_to_library"]

async def update_usd(token: tuple[str, None], track_id: str, change: USDType, param: tuple[str, int]) -> bool:
    if token is None:
        logger.error("No token provided")
        return False

    user = await get_user(token)
    if not user or not user[0]:
        logger.error(f"No user found for token: {token}")
        return False

    song = await sql("SELECT 1 FROM songs_data WHERE track_id = ?", [track_id], fetch_success=True)
    if not song:
        logger.error(f"No Song found for track_id: {track_id}")
        return False
    
    user_id = user[0].signup_number
    usd = await sql("SELECT 1 FROM user_song_data WHERE track_id = ? AND user_id = ?", [track_id, user_id], fetch_success=True)
    if not usd:
        if await sql("INSERT INTO user_song_data (user_id, track_id) VALUES (?,?)", [user_id, track_id], fetch_success=True):
            logger.error(f"Failed to create instance for: (user_id: {user_id}, track_id: {track_id})")
            return False
    
    try:
        await sql(f"UPDATE user_song_data SET {change} = ? WHERE track_id = ? AND user_id = ?", [param, track_id, user_id])
        return True
    except Exception as e:
        logger.error(f"Error updating user song data: {str(e)}")
        return False

async def get_all_songs(token: str):
    songs = None
    if token is not None:
        logger.debug(f"Getting user from token: {token}")
        user = await get_user(token)
        if user and user[0]:
            logger.debug(f"username: {user[0].username}")
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
                    sd.genre,
                    sd.tags,
                    sd.listen_time_seconds,
                    sd.last_played,
                    sd.img_url,
                    a.name as artist_name,
                    ud.favorite,
                    ud.rating,
                    ud.last_played as i_last_played,
                    ud.skip_count,
                    ud.added_to_library,
                    ud.listen_time_seconds as my_listen_time_seconds
                FROM songs s
                LEFT JOIN songs_data sd ON sd.track_id = s.track_id
                LEFT JOIN artists a ON a.artist_track_id = sd.artist_track_id
                LEFT JOIN user_song_data ud ON ud.track_id = s.track_id AND ud.user_id = ?
                ORDER BY RANDOM()
            """, [user[0].signup_number], fetch_results=True)
        else:
            logger.debug(f"No user found, token: {token}")
    if songs is None:
        logger.debug(f"No user found for token: {token}")
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
                    sd.genre,
                    sd.tags,
                    sd.listen_time_seconds,
                    sd.last_played,
                    sd.img_url,
                    a.name as artist_name
                FROM songs s
                LEFT JOIN songs_data sd ON sd.track_id = s.track_id
                LEFT JOIN artists a ON a.artist_track_id = sd.artist_track_id
                ORDER BY RANDOM()
            """, fetch_results=True)
    for song in songs:
        if song.tags:
            song.tags = song.tags.split(",")
        else:
            await sql("UPDATE songs_data SET tags = '' WHERE track_id = ?", [song.track_id])
    return songs
##D --------------------------USER MUSIC---------------------------

##U -----------------------------USER------------------------------
# TODO user_song_history implementation
@app.route('/api/taken', methods=['POST'])
async def is_taken():
    data = request.json
    value = data.get('value')
    exists = await sql("SELECT 1 FROM user WHERE username = ? OR email = ?", [value, value], fetch_success=True)
    return jsonify({ "exists": exists })

@app.route('/api/register_user', methods=['POST'])
async def register_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    json = await create_user(username, email, password)

    return jsonify(json)

@app.route('/api/login', methods=['POST'])
async def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"success": False, "error": "Missing required fields"})
    
    login_result = await login_user(username, password)
    if login_result: 
        session_result = await create_session_for_user(username)
        if session_result['success']:
            response = make_response(jsonify({'success': True, 'message': 'Logged in successfully'}))
            response.set_cookie('session_token', session_result['session_token'], 
                                httponly=True, 
                                secure=True,
                                samesite='Strict', 
                                max_age=(60 * 60 * 24 * 30))
            return response
        else:
            return jsonify({'success': False, 'message': 'Failed to create session'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'})

@app.route('/api/protected', methods=['GET'])
async def protected():
    token = request.cookies.get('session_token')
    
    if not token:
        return jsonify({'success': False, 'message': 'Unauthorized'})

    user = await get_user(token)
    
    if user and user[0]:
        if get_time() > user[0].expiry:
            return jsonify({'success': False, 'message': 'Session expired'})
        return jsonify({'success': True, 'message': f'Access granted to {user[0].username}'})
    else:
        return jsonify({'success': False, 'message': 'Unauthorized'})

@app.route('/api/logout', methods=['POST'])
async def logout():
    token = request.cookies.get('session_token')
    if token:
        await sql("DELETE FROM user_sessions WHERE session_token = ?", [token])
    
    response = make_response(jsonify({'message': 'Logged out successfully'}))
    response.delete_cookie('session_token')
    return response

@app.route('/api/verify_email', methods=['POST'])
async def verify_email():
    data = request.json
    email = data.get('email')
    code = data.get('code')

    if not email or not code:
        return jsonify({"success": False, "message": ["Missing required fields"]})

    user = await sql("SELECT * FROM user WHERE email = ?", [email], fetch_results=True)

    if not user or not user[0]:
        return jsonify({"success": False, "message": ["Invalid email"]})

    if user[0].verified == 1:
        return jsonify({"success": True, "message": ["Email already verified", "Redirecting..."]})

    if get_time() > int(user[0].code_expiry):
        return jsonify({"success": False, "message": ["Verification failed", "code expired"]})

    if str(code) != str(user[0].verify_email_code):
        return jsonify({"success": False, "message": ["Wrong verification code", "try again"]})

    await sql("UPDATE user SET verified = 1, verify_email_code = NULL, code_expiry = NULL WHERE email = ?", [email])
    return jsonify({"success": True, "message": ["Successfully verified!", "Login to complete signing up."]})

@app.route('/api/send_new_code', methods=['POST'])
async def send_new_code():
    data = request.json
    email = data.get('email')
    send_code = await send_new_verify_code(email)
    return jsonify(send_code)

@app.route('/api/user_data', methods=['POST'])
async def user_data():
    token = request.cookies.get('session_token')
    if not token:
        return jsonify({"success": False})
    
    user = await get_user(token)

    if user and user[0]:
        return jsonify({"success": True, "user": format_namedtuple(user)[0]})
    else:
        return jsonify({"success": False})

async def send_verification_email(to_email, username, verification_code):
    # Email configuration
    smtp_server = "smtp.gmail.com"
    smtp_port = 465  # Changed to 465 for SSL
    sender_email = GMAIL
    sender_password = GMAIL_PASSWORD

    # Create message
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = to_email
    message["Subject"] = "Your Verification Code"

    code_str = str(verification_code)
    mid = len(code_str) // 2
    v_code = f"{code_str[:mid]} - {code_str[mid:]}"

    # Email body
    body = f"Hello {username}, \n\nyour verification code is: {v_code}\nThis code will expire in 5 minutes."
    message.attach(MIMEText(body, "plain"))

    # Send email
    try:
        smtp_client = aiosmtplib.SMTP(hostname=smtp_server, port=smtp_port, use_tls=True)
        await smtp_client.connect()
        await smtp_client.login(sender_email, sender_password)
        await smtp_client.send_message(message)
        await smtp_client.quit()
        logger.debug("Verification email sent successfully")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False

def generate_verification_code(length = 6) -> str:
    return ''.join(str(random.randint(0, 9)) for _ in range(length))

def hash_password(password):
    # Convert the password to bytes
    password_bytes = password.encode('utf-8')
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password

def verify_password(plain_password, hashed_password):
    # Convert the plain_password to bytes
    password_bytes = plain_password.encode('utf-8')
    # Check if the plain password matches the hashed password
    return bcrypt.checkpw(password_bytes, hashed_password)

def generate_session_token(length=32):
    """Generate a secure random session token."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


async def create_session_for_user(username: str):
    try:
        user = await sql("SELECT * FROM user WHERE username = ? OR email = ?", [username, username], fetch_results=True)
        if user and not user[0]:
            return {"success": False, "message": "User not found", "session_token": None}
        
        session_token = generate_session_token()
        expiry = get_time(60 * 60 * 24 * 30)
        session = await sql("""
            INSERT INTO user_sessions
            (user_id, session_token, expiry)
            VALUES (?,?,?)
        """, [user[0].id, session_token, expiry])

        if session == None:
            return {"success": True, "message": "Successfully created session token", "session_token": session_token}
        else: 
            return {"success": False, "message": "Something went wrong", "session_token": None}
    except Exception as e:
        logger.error(f"Error (create session): {e}")
        return {"success": False, "message": str(e), "session_token": None}

async def send_new_verify_code(email: str):
    try:
        user = await sql("SELECT * FROM user WHERE email = ?", [email], fetch_results=True)
        if user[0].verified:
           return {"success": False, "message": "User already verified", "verified": True}
        
        verify_code = generate_verification_code()
        username = user[0].username
        code_expiry = get_time(5 * 60)

        send_mail = await send_verification_email(email, username, verify_code)

        if send_mail:
            updated = await sql("UPDATE user SET verify_email_code = ?, code_expiry = ? WHERE email = ?", [verify_code, code_expiry, email])
            logger.debug(updated)
            return {"success": True, "message": "Send new verification code", "verified": False}
        else:
            return {"success": False, "message": "Error sending email", "verified": False}
    except Exception as e:
        logger.error(e)
        return {"success": False, "message": str(e)}

async def create_user(username: str, email: str, password: str):
    send_mail = False
    try:
        created_at = get_time()
        hashed_password = hash_password(password)
        verify_code = generate_verification_code()
        code_expiry = get_time(5 * 60)
        
        created = await sql(""" 
            INSERT INTO user
            (username, email, password, created_at, verify_email_code, code_expiry)
            VALUES (?,?,?,?,?,?)
        """, [username, email, hashed_password, created_at, verify_code, code_expiry], fetch_success=True)
        
        if created == None:
            send_mail = await send_verification_email(email, username, verify_code)
            return {"success": True, "message": ["Successfully created account!", "Redirecting to email verification..."], "send_mail": send_mail}
        else:
            return {"success": False, "message": ["Failed to create user account!", "Please try again."], "send_mail": send_mail}
    
    except Exception as e:
        return {"success": False, "message": ["Failed to create user account!", str(e)], "send_mail": send_mail}

async def login_user(username: str, password: str) -> bool:
    try:
        user = await sql("SELECT * FROM user WHERE username = ? OR email = ?", [username, username], fetch_results=True)
        if not user or not user[0]:
            return False
        
        hashed_password = user[0].password
        now = get_time()

        if verify_password(password, hashed_password):
            await sql("UPDATE user SET last_login = ? WHERE username = ? OR email = ?", [now, username, username])
            return True
        else:
            return False
    except Exception as e:
        logger.error(f"Error in login_user: {e}")
        return False

async def get_user(token: str):
    return await sql("""
        SELECT 
            u.id as signup_number,
            u.username,
            u.email,
            u.created_at,
            u.verified,
            u.img_url
        FROM user_sessions us
        INNER JOIN user u ON us.user_id = u.id
        WHERE us.session_token = ?
    """, [token], fetch_results=True)
##U -----------------------------USER------------------------------

##G -----------------------------GLOBAL----------------------------
def get_time(add: int = 0):
    '''
    # : add -> the time to add in seconds
    '''
    return round(time.time() * 1000) + add

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
                logger.error(f"Database is locked. Retrying in {wait_time} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
            else:
                logger.error(f"Database error after {attempt + 1} attempts: {e}")
                logger.error(f"Query: {query}")
                logger.error(f"Parameters: {params}")
                if fetch_success:
                    return False
                raise
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            logger.error(f"Query: {query}")
            logger.error(f"Parameters: {params}")
            if fetch_success:
                return False
            raise
    
    logger.error(f"Failed to execute query after {max_retries} attempts")
    return False if fetch_success else None
##G -----------------------------GLOBAL----------------------------

##S -----------------------------SETUP-----------------------------
async def get_song_data(root: str, file: str):
    name, _ = os.path.splitext(file)
    full_path = os.path.join(root, file)
    audio = File(full_path)
    if audio is None:
        logger.error(f"\033[31maudio is none: \033[0m{name}")
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
            sd.genre,
            sd.tags,
            sd.listen_time_seconds,
            sd.last_played,
            a.name as artist_name
        FROM songs s
        LEFT JOIN songs_data sd ON sd.track_id = s.track_id
        LEFT JOIN artists a ON a.artist_track_id = sd.artist_track_id
        WHERE s.name = ? AND s.track_id = ?
    """, [name, track_id], fetch_results=True)
    song = song[0] if song else None

    relative_path = os.path.relpath(full_path, MUSIC_DIR)
    
    song_data = {
        "name": name,
        "file_exists": 1,
        "artist_track_id": song.artist_track_id if song else "",
        "artist_name": artist_name or (song.artist_name if song else ""),
        "album": audio.tags.get('ALBUM', [''])[0] or (song.album if song else ""),
        "genre": audio.tags.get('GENRE', [''])[0] or (song.genre if song else ""),
        "tags": song.tags if song else "",
        "birth_date": birth_date or (song.birth_date if song else 0),
        "duration": duration or (song.duration if song else 0),
        "listen_time_seconds": song.listen_time_seconds if song else 0,
        "added": song.added if song else get_time(),
        "track_id": track_id,
        "last_played": song.last_played if song else None,
        "path": (song.rel_path if song else relative_path),
        "yt_link": yt_link or (song.yt_link if song else ""),
    }

    return song_data

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
                logger.debug(f"\033[34m{artist_name}\033[0m track_id found and changed: \033[31m{old_id}\033[0m -> \033[32m{artist_track_id}\033[0m")

            await sql('INSERT or IGNORE INTO artists (name, artist_track_id) VALUES (?,?)', [artist_name, artist_track_id])
            logger.debug(f"Created new \033[34mArtist\033[0m: \033[36m{artist_name}\033[0m - \033[32m{artist_track_id}\033[0m")
            artists[artist_name] = artist_track_id
            track_ids.append(artist_track_id)
        else:
            artist_track_id = artists.get(artist_name, "00000000")

        song_data = [
            song["name"], 1, artist_track_id, artist_name, song.get("album"), song.get("genre"),
            song["birth_date"], song["duration"], 0, get_time(), song["track_id"], None,
            song["path"], song["yt_link"]
        ]

        try:
            await sql("""
                INSERT or IGNORE INTO songs
                (name, file_exists, o_artist_name, birth_date, duration, added, rel_path, track_id, yt_link)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [song["name"], 1, artist_name, song["birth_date"], song["duration"], get_time(), song["path"], song["track_id"], song["yt_link"]])
            await sql("""
                INSERT INTO songs_data
                (name, artist_track_id, album, genre, listen_time_seconds, last_played, track_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, [song["name"], artist_track_id, song.get("album"), song.get("genre"), 0, 0, song["track_id"]])
            logger.debug(f"Created new \033[33mSong\033[0m: \033[35m{song_data[0]}\033[0m")
        except Exception as e:
            logger.error(f"Error inserting song: {e}")
            return False
        return True

    tasks = [insert_song(song) for song in songs]
    results = await asyncio.gather(*tasks)
    
    inserted_count = sum(results)
    logger.debug(f"Inserted \033[32m{inserted_count}\033[0m new songs out of \033[35m{len(songs)}\033[0m total songs.")

async def sync_all_songs_with_db():
    logger.debug("Start syncing DB with files")
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

    logger.debug(f"Processed \033[32m{len(opus_files)}\033[0m files")

async def init_db():
    logger.debug("Initializing db")
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
            genre TEXT,
            tags TEXT,
            listen_time_seconds INTEGER DEFAULT 0,
            last_played INTEGER DEFAULT 0,
            track_id TEXT UNIQUE,
            img_url TEXT,
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

        # Create user table
        await sql("""
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at INTEGER, -- in ms
            last_login INTEGER,
            img_url TEXT,
            verified INTEGER DEFAULT 0,
            verify_email_code TEXT,
            code_expiry INTEGER
        );
        """)

        # sessions for users
        await sql("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT NOT NULL,
            expiry INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user(id) 
        );
        """)

        # Create user_song_data table
        await sql("""
        CREATE TABLE IF NOT EXISTS user_song_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            track_id TEXT NOT NULL,
            listen_time_seconds INTEGER DEFAULT 0,
            favorite INTEGER DEFAULT 0,
            rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
            last_played INTEGER,
            skip_count INTEGER DEFAULT 0,
            first_played INTEGER,
            added_to_library INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES user(id),
            FOREIGN KEY (track_id) REFERENCES songs(track_id),
            UNIQUE (user_id, track_id)
        );
        """)

        # Create user_song_history table
        await sql("""
        CREATE TABLE IF NOT EXISTS user_song_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            track_id TEXT NOT NULL,
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
        await sql("CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_data_user_id ON user_song_data(user_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_data_track_id ON user_song_data(track_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_history_user_id ON user_song_history(user_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_history_track_id ON user_song_history(track_id);")
        await sql("CREATE INDEX IF NOT EXISTS idx_user_song_history_date ON user_song_history(date);")
        
        logger.debug("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise
##S -----------------------------SETUP-----------------------------

##M -----------------------------MAIN------------------------------
async def main():
    await init_db()
    await sync_all_songs_with_db()

if __name__ == '__main__':
    asyncio.run(main())
    try:
        app.run(
            host='192.168.7.146',
            port=8000,
            debug=True,
            ssl_context=('cert.pem', 'key.pem')
        )
    finally:
        logger.debug("Bye...")
##M -----------------------------MAIN------------------------------