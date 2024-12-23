# -*- coding: utf-8 -*-
import os
import json
import math
import re
import time
import random 
import string
import secrets
import asyncio
import logging
import subprocess
import urllib.parse
from typing import Optional
from datetime import datetime
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
from googleapiclient.discovery import build # type: ignore
from googleapiclient.errors import HttpError # type: ignore
from flask import Flask, send_file, abort, request, jsonify, make_response # type: ignore

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
executor = Executor(app)
# CORS(app)
IP_ADDRESS = os.environ.get('IP_ADDRESS')
FRONTEND_URL = f"https://{IP_ADDRESS if IP_ADDRESS else 'localhost'}:3000"
CORS(app, resources={r"/api/*": { "origins": FRONTEND_URL, "supports_credentials": True }})

ROOT_PATH = os.environ.get("ROOT_PATH")
ENV_DIR = f"{ROOT_PATH}{os.environ.get('ENV_DIR')}"
MUSIC_DIR = f"{ROOT_PATH}{os.environ.get('MUSIC_DIR')}"
VIDEOS_DIR = f"{ROOT_PATH}{os.environ.get('VIDEOS_DIR')}"
DB_FILE = f"{ENV_DIR}/data/music.db"

IMAGES_DIR = f"{ROOT_PATH}{os.environ.get('IMAGES_DIR')}"
RANDOM_IMAGES_DIR = f"{IMAGES_DIR}/Random"
PROFILE_IMAGES_DIR = f"{IMAGES_DIR}/Profile"
NOTFOUND_IMAGES_DIR = f"{IMAGES_DIR}/NotFound"
THUMBNAIL_IMAGES_DIR = f"{IMAGES_DIR}/Thumbnails"

GMAIL = os.environ.get('GMAIL')
GMAIL_PASSWORD = os.environ.get('GMAIL_PASSWORD')
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')

##L -------------------------CUSTOM LOGGER-------------------------
class CustomFormatter(logging.Formatter):
    grey = "\x1b[38;20m"
    blue = "\x1b[34;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    information = "\033[1;32m(l:%(lineno)d):\033[0m " # %(name)s / %(filename)s / %(levelname)s / %(asctime)s

    FORMATS = {
        logging.DEBUG: information + grey + "%(message)s" + reset,
        logging.INFO: information + blue + "%(message)s" + reset,
        logging.WARNING: information + yellow + "%(message)s" + reset,
        logging.ERROR: information + red + "%(message)s" + reset,
        logging.CRITICAL: information + bold_red + "%(message)s" + reset
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

##I -----------------------------IMAGE-----------------------------
@app.route("/api/img/<path:path>", methods=['GET'])
def get_img(path: str):
    file_path = os.path.join(IMAGES_DIR, path)
    
    if os.path.exists(file_path):
        return send_file(file_path)
    else:
        not_found = get_random_img_rel_path(NOTFOUND_IMAGES_DIR)
        not_found_file = os.path.join(NOTFOUND_IMAGES_DIR, not_found)
        return send_file(not_found_file)
##I -----------------------------IMAGE-----------------------------

##M -----------------------------MEDIA-----------------------------
@app.route('/api/search', methods=['GET'])
async def search():
    token = request.cookies.get('session_token')
    query = request.args.get('q')
    search_for = request.args.get('sf')
    artist_id = request.args.get('aid')
    artist_id = "%" if artist_id == "" else artist_id
    search_for = search_for.split(',') if search_for is not None else ['s', 'a', 'v']
    user = await get_user(token)

    query = f"%{query}%"
    items = []

    include_s = True if "s" in search_for != -1 else False
    include_v = True if "v" in search_for != -1 else False
    include_a = True if "a" in search_for != -1 else False
    include_all = not include_a and not include_s and not include_v

    if include_s or include_v or include_all:
        medias = await sql("""
            SELECT 
                m.file_exists,
                m.name,
                m.date,
                m.duration,
                m.added,
                m.track_id,
                m.yt_link,
                m.yt_id,
                m.type,
                md.artist_id,
                md.tags,
                md.consume_time_seconds,
                md.last_consumed,
                md.album,
                md.genre,
                md.img_url,
                a.name as artist_name,
                umd.favorite,
                umd.rating,
                umd.last_consumed as i_last_consumed,
                umd.added_to_library,
                umd.skip_count,
                umd.consume_time_seconds as my_consume_time_seconds
            FROM media m
            INNER JOIN artists a ON m.artist_id = a.artist_id
            LEFT JOIN media_data md ON m.track_id = md.track_id
            LEFT JOIN user_media_data umd ON m.track_id = umd.track_id AND umd.user_id = ?
            WHERE LOWER(m.name) LIKE ? AND LOWER(md.artist_id) LIKE ?
        """, [user['id'], query, artist_id], fetch_results=True)
        
        remaining = []

        for media in medias:
            if include_all:
                remaining.append(media)
            if media.type == "s" and include_s:
                remaining.append(media)
            if media.type == "v" and include_v:
                remaining.append(media)
        
        items += add_type_to_namedtuple('media', format_namedtuple(remaining))

    if include_a or include_all and artist_id == "%":
        artists = await sql("""
            SELECT 
                a.*,
                uad.favorite, 
                uad.rating 
            FROM artists a 
            LEFT JOIN user_artist_data uad ON uad.user_id = ? AND uad.artist_id = a.artist_id
            WHERE LOWER(a.name) LIKE ?
        """, [user['id'], query], fetch_results=True)
        items += add_type_to_namedtuple('artist', format_namedtuple(artists))

    return jsonify(items)

@app.route('/api/medias', methods=['GET'])
async def medias():
    token = request.cookies.get('session_token')
    amount = request.args.get('a') or -1
    media_type = request.args.get('mt') or 's'
    track = request.args.get('t')

    if track is not None:
        media_type = track[0:1]
    
    if not int(amount):
        return jsonify({ "error": "Invalid amount" })
    
    medias = await get_medias(token, amount if track is None else 1, track, media_type)

    if medias is None:
        return jsonify({ "error": "Invalid media type" })

    return jsonify(medias)

@app.route('/api/update_consume_time', methods=['POST'])
async def update_consume_time():
    token = request.cookies.get('session_token')
    track = request.json.get('track')
    time = math.floor(int(request.json.get('time')))

    if track is None:
        return jsonify({ "error": "No track set" })
    
    await sql("""
        UPDATE media_data
        SET consume_time_seconds = consume_time_seconds + ?
        WHERE track_id = ?
    """, [time, track])

    updated = True

    if track:
        updated = await update_ud(token, track, 'consume_time_seconds', time)

    if updated:
        return jsonify({ "success": "Successfully updated consume time" })
    else:
        return jsonify({ "error": "Error changing user specific consume time" })

current_track_id = ""
@app.route('/api/consume', methods=['GET'])
async def consume():
    global current_track_id
    token = request.cookies.get('session_token')
    track = request.args.get('t')
    byte_range = request.headers.get('Range')
    user = await get_user(token)

    if track is None:
        track = "s"

    media = None
    if len(track) == 1:
        if byte_range == "0-1" or byte_range is None:
            media = await sql("SELECT * FROM media WHERE type = ? ORDER BY RANDOM() LIMIT 1", [track], fetch_results=True)
        else:
            media = await sql("SELECT * FROM media WHERE track_id = ? LIMIT 1", [current_track_id], fetch_results=True)
    else:
        media = await sql("SELECT * FROM media WHERE track_id = ? LIMIT 1", [track], fetch_results=True)

    if len(media) <= 0:
        return jsonify({ "error": "No media found" })

    media = format_namedtuple(media, first=True)
    track = media['track_id']
    media_type = track[:1]
    current_track_id = track

    if media_type == 's':
        full_path = os.path.join(MUSIC_DIR, media['rel_path'])

    if media_type == 'v':
        full_path = os.path.join(VIDEOS_DIR, media['rel_path'])

    await sql("UPDATE media_data SET last_consumed = ? WHERE track_id = ?", [get_time(), track])

    if user is not None:
        await update_ud(token, track, "last_consumed", get_time())
        await update_media_history(user, track)

    return send_file(full_path)

@app.route('/api/uud', methods=['POST'])
async def uud():
    data = request.json
    token = request.cookies.get('session_token')
    track_id = data.get('target_id')
    change = data.get('change')
    to = data.get('to')
    target_type = data.get('type')

    artist = True if target_type == "artist" else False

    updated = await update_ud(token, track_id, change, to, artist)

    if updated:
        return jsonify({ "success": True , "message": "Successfully Changed user specific data" })
    else:
        return jsonify({ "success": False , "error": "Not Authorized" })

UDType = Literal["last_consumed", "consume_time_seconds", "favorite", "rating", "first_consumed", "added_to_library"]

async def update_ud(token: tuple[str, None], target_id: str, change: UDType, param: tuple[str, int], artist = False) -> bool:
    user_data_table = "user_artist_data" if artist else "user_media_data"
    data_table = "artists" if artist else "media_data"
    id_name = "artist_id" if artist else "track_id"

    if token is None:
        logger.error("No token provided")
        return False

    user = await get_user(token)
    if user is None:
        logger.error(f"No user found for token: {token}")
        return False
    
    target = await sql(f"SELECT 1 FROM {data_table} WHERE {id_name} = ?", [target_id], fetch_success=True)
    if not target:
        logger.error(f"No Media/Artist found for {id_name}: {target_id}")
        return False
    
    user_id = user['id']
    ud = await sql(f"SELECT 1 FROM {user_data_table} WHERE {id_name} = ? AND user_id = ?", [target_id, user_id], fetch_success=True)
    if not ud:
        if not await sql(f"INSERT INTO {user_data_table} (user_id, {id_name}) VALUES (?,?)", [user_id, target_id], fetch_success=True):
            logger.error(f"Failed to create instance for: (user_id: {user_id}, {id_name}: {target_id})")
            return False
    
    try:
        if change == "consume_time_seconds":
            # logger.info(f"{change}: ? + {param}")
            await sql(f"UPDATE {user_data_table} SET {change} = {change} + ? WHERE {id_name} = ? AND user_id = ?", [param, target_id, user_id])
        else:
            # logger.info(f"{change}: {param}")
            await sql(f"UPDATE {user_data_table} SET {change} = ? WHERE {id_name} = ? AND user_id = ?", [param, target_id, user_id])
        return True
    except Exception as e:
        logger.error(f"Error updating user media/artist data: {str(e)}")
        return False

async def update_media_history(user, track):
    date = f"{datetime.now():%d-%m-%Y}"
    logger.debug(f"{date}")

async def get_medias(token: str, max_amount = -1, track: str = None, media_type: str = "s"):
    media = None
    if max_amount == -1 and track is not None:
        max_amount = 1
    elif track is None:
        track = "%"

    if token is not None:
        user = await get_user(token)
        if user is not None:
            media = await sql(f"""
                SELECT 
                    m.file_exists,
                    m.name,
                    m.date,
                    m.duration,
                    m.added,
                    m.track_id,
                    m.yt_link,
                    m.yt_id,
                    m.type,
                    md.artist_id,
                    md.tags,
                    md.consume_time_seconds,
                    md.last_consumed,
                    md.album,
                    md.genre,
                    md.img_url,
                    a.name as artist_name,
                    ud.favorite,
                    ud.rating,
                    ud.last_consumed as i_last_consumed,
                    ud.added_to_library,
                    ud.skip_count,
                    ud.consume_time_seconds as my_consume_time_seconds
                FROM media m
                LEFT JOIN media_data md ON md.track_id = m.track_id
                LEFT JOIN artists a ON a.artist_id = md.artist_id
                LEFT JOIN user_media_data ud ON ud.track_id = m.track_id AND ud.user_id = ?
                WHERE m.track_id LIKE ? AND m.type = ?
                ORDER BY RANDOM()
                LIMIT ?
            """, [user['id'], track, media_type, max_amount], fetch_results=True)
    if media is None:
        media = await sql("""
                SELECT 
                    m.file_exists,
                    m.name,
                    m.date,
                    m.duration,
                    m.added,
                    m.track_id,
                    m.yt_link,
                    m.yt_id,
                    m.type,
                    md.artist_id,
                    md.tags,
                    md.consume_time_seconds,
                    md.last_consumed,
                    md.album,
                    md.genre,
                    md.img_url,
                    a.name as artist_name
                FROM media m
                LEFT JOIN media_data md ON md.track_id = m.track_id
                LEFT JOIN artists a ON a.artist_id = md.artist_id
                WHERE m.track_id LIKE ? AND m.type = ?
                ORDER BY RANDOM()
                LIMIT ?
            """, [track, media_type, max_amount], track, fetch_results=True)
    return format_namedtuple(media)
##M -----------------------------MEDIA-----------------------------

# ##V ----------------------------VIDEOS-----------------------------
# @app.route('/api/videos', methods=['GET'])
# async def videos():
#     token = request.cookies.get('session_token')
#     amount = request.args.get('a') or -1
    
#     if amount is None or not int(amount):
#         return jsonify({ "error": "Invalid amount" })

#     videos = await get_videos(token, amount)

#     return jsonify(videos)

# @app.route('/api/watch', methods=['GET'])
# async def watch():
#     token = request.cookies.get('session_token')
#     track = request.args.get('t')
#     user = await get_user(token)
    
#     video = await sql("SELECT * FROM videos WHERE track_id = ?", [track], fetch_results=True)

#     if len(video) <= 0:
#         return jsonify({ "error": "No video found" })

#     video = format_namedtuple(video, first=True)
#     full_path = os.path.join(VIDEOS_DIR, video['rel_path'])

#     await sql("UPDATE video_data SET last_played = ? WHERE track_id = ?", [get_time(), track])

#     if user is not None:
#         logger.debug(user['username'])
#         await update_uvd(token, track, "last_played", get_time())

#     return send_file(full_path)

# UVDType = Literal["last_played", "watch_time_seconds", "favorite", "rating", "first_played", "added_to_library"]

# async def update_uvd(token: tuple[str, None], track_id: str, change: UVDType, param: tuple[str, int]) -> bool:
#     if token is None:
#         logger.error("No token provided")
#         return False

#     user = await get_user(token)
#     if user is None:
#         logger.error(f"No user found for token: {token}")
#         return False

#     video = await sql("SELECT 1 FROM video_data WHERE track_id = ?", [track_id], fetch_success=True)
#     if not video:
#         logger.error(f"No Video found for track_id: {track_id}")
#         return False
    
#     user_id = user['id']
#     uvd = await sql("SELECT 1 FROM user_video_data WHERE track_id = ? AND user_id = ?", [track_id, user_id], fetch_success=True)
#     if not uvd:
#         if await sql("INSERT INTO user_video_data (user_id, track_id) VALUES (?,?)", [user_id, track_id], fetch_success=True):
#             logger.error(f"Failed to create instance for: (user_id: {user_id}, track_id: {track_id})")
#             return False
    
#     try:
#         if change == "watch_time_seconds":
#             await sql(f"UPDATE user_video_data SET {change} = {change} + ? WHERE track_id = ? AND user_id = ?", [param, track_id, user_id])
#         else:
#             await sql(f"UPDATE user_video_data SET {change} = ? WHERE track_id = ? AND user_id = ?", [param, track_id, user_id])
#         return True
#     except Exception as e:
#         logger.error(f"Error updating user video data: {str(e)}")
#         return False

# async def get_videos(token: str, max_amount = -1):
#     videos = None
#     if token is not None:
#         user = await get_user(token)
#         if user is not None:
#             videos = await sql("""
#                 SELECT 
#                     v.file_exists,
#                     v.name,
#                     v.date,
#                     v.duration,
#                     v.added,
#                     v.track_id,
#                     v.yt_link,
#                     vd.artist_id,
#                     vd.tags,
#                     vd.watch_time_seconds,
#                     vd.last_played,
#                     a.name as artist_name,
#                     ud.favorite,
#                     ud.rating,
#                     ud.last_played as i_last_played,
#                     ud.added_to_library,
#                     ud.watch_time_seconds as my_watch_time_seconds
#                 FROM videos v
#                 LEFT JOIN video_data vd ON vd.track_id = v.track_id
#                 LEFT JOIN artists a ON a.artist_id = vd.artist_id
#                 LEFT JOIN user_video_data ud ON ud.track_id = v.track_id AND ud.user_id = ?
#                 ORDER BY RANDOM()
#                 LIMIT ?
#             """, [user['id'], max_amount], fetch_results=True)
#     if videos is None:
#         videos = await sql("""
#                 SELECT 
#                     v.file_exists,
#                     v.name,
#                     v.date,
#                     v.duration,
#                     v.added,
#                     v.track_id,
#                     v.yt_link,
#                     vd.artist_id,
#                     vd.tags,
#                     vd.watch_time_seconds,
#                     vd.last_played,
#                     a.name as artist_name
#                 FROM videos v
#                 LEFT JOIN video_data vd ON vd.track_id = v.track_id
#                 LEFT JOIN artists a ON a.artist_id = vd.artist_id
#                 ORDER BY RANDOM()
#                 LIMIT ?
#             """, [max_amount], fetch_results=True)
#     return format_namedtuple(videos)

# async def get_video(track_id: str, token: str):
#     video = None
#     logger.info(token)
#     if token is not None:
#         user = await get_user(token)
#         if user is not None:
#             video = await sql("""
#                 SELECT 
#                     v.file_exists,
#                     v.name,
#                     v.date,
#                     v.duration,
#                     v.added,
#                     v.track_id,
#                     v.yt_link,
#                     vd.artist_id,
#                     vd.tags,
#                     vd.watch_time_seconds,
#                     vd.last_played,
#                     a.name as artist_name,
#                     ud.favorite,
#                     ud.rating,
#                     ud.last_played as i_last_played,
#                     ud.added_to_library,
#                     ud.watch_time_seconds as my_watch_time_seconds
#                 FROM videos v
#                 LEFT JOIN video_data vd ON vd.track_id = v.track_id
#                 LEFT JOIN artists a ON a.artist_id = vd.artist_id
#                 LEFT JOIN user_video_data ud ON ud.track_id = v.track_id AND ud.user_id = ?
#                 ORDER BY RANDOM()
#                 LIMIT 1
#             """, [user['id'], track_id], fetch_results=True)[0]
#     if video is None:
#         video = await sql("""
#                 SELECT 
#                     v.file_exists,
#                     v.name,
#                     v.date,
#                     v.duration,
#                     v.added,
#                     v.track_id,
#                     v.yt_link,
#                     vd.artist_id,
#                     vd.tags,
#                     vd.watch_time_seconds,
#                     vd.last_played,
#                     a.name as artist_name,
#                     ud.favorite,
#                     ud.rating,
#                     ud.last_played as i_last_played,
#                     ud.added_to_library,
#                     ud.watch_time_seconds as my_watch_time_seconds
#                 FROM videos v
#                 LEFT JOIN video_data vd ON vd.track_id = v.track_id
#                 LEFT JOIN artists a ON a.artist_id = vd.artist_id
#                 LEFT JOIN user_video_data ud ON ud.track_id = v.track_id AND ud.user_id = ?
#                 ORDER BY RANDOM()
#                 LIMIT 1
#             """, [track_id], fetch_results=True)[0]
#     return format_namedtuple(video)
# ##V ----------------------------VIDEOS-----------------------------

# ##M -----------------------------MUSIC-----------------------------
# # TODO
# @app.route('/api/search', methods=['GET'])
# async def search_in_db():
#     query: Optional[str] = request.args.get('q')
#     if query is None:
#         query = ""
#     query = query.lower()
#     limit: int = int(request.args.get('limit', 100))
#     pattern = f"%{'%'.join(query)}%"
#     sql_query = """
#         SELECT
#             s.file_exists,
#             s.name,
#             s.date,
#             s.duration,
#             s.added,
#             s.track_id,
#             s.yt_link,
#             sd.artist_id,
#             sd.album,
#             sd.genre,
#             sd.tags,
#             sd.listen_time_seconds,
#             sd.last_played,
#             sd.img_url,
#             a.name as artist_name
#         FROM songs s
#         LEFT JOIN songs_data sd ON sd.track_id = s.track_id
#         LEFT JOIN artists a ON a.artist_id = sd.artist_id
#         WHERE LOWER(s.name) LIKE ? 
#             OR LOWER(a.name) LIKE ? 
#             OR s.track_id = ?
#         ORDER BY sd.listen_time_seconds DESC, s.added DESC
#         LIMIT ?
#     """
    
#     # Execute the query using your custom sql function
#     songs = await sql(sql_query, [pattern, pattern, query, limit], fetch_results=True)
    
#     result = format_namedtuple(songs)
#     return jsonify(result)

# @app.route('/api/songs', methods=['GET'])
# async def songs():
#     token = request.cookies.get('session_token')
#     max_amount = request.args.get('a')

#     if max_amount is not None and max_amount.isdigit():
#         max_amount = int(max_amount)
#     else:
#         max_amount = -1
    
#     songs = await get_songs(token, max_amount)

#     return jsonify(songs)

# @app.route('/api/update_listen_time', methods=['POST'])
# async def update_listen_time():
#     token = request.cookies.get('session_token')
#     track = request.json.get('track')
#     time = math.floor(int(request.json.get('time')))

#     if track is None:
#         return jsonify({ "error": "No track set" })
    
#     await sql("""
#         UPDATE songs_data
#         SET listen_time_seconds = listen_time_seconds + ?
#         WHERE track_id = ?
#     """, [time, track])

#     updated = True

#     if track:
#         updated = await update_usd(token, track, 'listen_time_seconds', time, add=True)

#     if updated:
#         return jsonify({ "success": "Successfully updated listen time" })
#     else:
#         return jsonify({ "error": "Error changing user specific listen time" })

# @app.route('/api/get_song', methods=['GET'])
# async def get_song():
#     token = request.cookies.get('session_token')
#     track = request.args.get('t')

#     song = await get_song(track, token)

#     return jsonify(song)

# @app.route('/api/play')
# async def play_song():
#     global current_track_id
#     track_id = request.args.get('t')
#     token = request.cookies.get('session_token')
#     range_header = request.headers.get('Range')
#     byte_range = range_header[6:] if range_header else None
    
#     try:
#         if track_id is None:
#             if byte_range == "0-1" or byte_range == None:
#                 songs = await sql("SELECT * FROM songs ORDER BY RANDOM() LIMIT 1", fetch_results=True)
#             else:
#                 songs = await sql("SELECT * FROM songs WHERE track_id = ? LIMIT 1", [current_track_id], fetch_results=True)
#         else:
#             songs = await sql("SELECT * FROM songs WHERE track_id = ?", [track_id], fetch_results=True)
        
#         song = format_namedtuple(songs, first=True)

#         current_track_id = song['track_id']
        
#         full_path = os.path.join(MUSIC_DIR, song["rel_path"])
#         if not os.path.exists(full_path):
#             logger.error(f"File not found: {full_path}")
#             abort(404)
        
#         await sql("UPDATE songs_data SET last_played = ? WHERE track_id = ?", [get_time(), track_id])

#         if token is not None:
#             await update_usd(token, song['track_id'], "last_played", get_time())

#         logger.info(f"{song['name']} ({song['track_id']})")

#         return send_file(full_path)
#     except Exception as e:
#         logger.error(f"Error serving track:{track_id}: {str(e)}")
#         abort(500)
# ##M -----------------------------MUSIC-----------------------------

# ##D --------------------------USER MUSIC---------------------------
# @app.route('/api/uusd', methods=['POST'])
# async def uusd():
#     data = request.json
#     token = request.cookies.get('session_token')
#     track_id = data.get('track_id')
#     change = data.get('change')
#     to = data.get('to')

#     updated = await update_usd(token, track_id, change, to)

#     if updated:
#         return jsonify({ "success": True , "message": "Successfully Changed user specific data" })
#     else:
#         return jsonify({ "success": False , "error": "Not Authorized" })

# # usd is user song data
# USDType = Literal["last_played", "listen_time_seconds", "favorite", "rating", "skip_count", "first_played", "added_to_library"]

# async def update_usd(token: tuple[str, None], track_id: str, change: USDType, param: tuple[str, int]) -> bool:
#     if token is None:
#         logger.error("No token provided")
#         return False

#     user = await get_user(token)
#     if user is None:
#         logger.error(f"No user found for token: {token}")
#         return False

#     song = await sql("SELECT 1 FROM songs_data WHERE track_id = ?", [track_id], fetch_success=True)
#     if not song:
#         logger.error(f"No Song found for track_id: {track_id}")
#         return False
    
#     user_id = user.id
#     usd = await sql("SELECT 1 FROM user_song_data WHERE track_id = ? AND user_id = ?", [track_id, user_id], fetch_success=True)
#     if not usd:
#         if await sql("INSERT INTO user_song_data (user_id, track_id) VALUES (?,?)", [user_id, track_id], fetch_success=True):
#             logger.error(f"Failed to create instance for: (user_id: {user_id}, track_id: {track_id})")
#             return False
    
#     try:
#         if change == "listen_time_seconds":
#             await sql(f"UPDATE user_song_data SET {change} = ? WHERE track_id = ? AND user_id = ?", [param, track_id, user_id])
#         else:
#             await sql(f"UPDATE user_song_data SET {change} = {change} + ? WHERE track_id = ? AND user_id = ?", [param, track_id, user_id])
#         return True
#     except Exception as e:
#         logger.error(f"Error updating user song data: {str(e)}")
#         return False

# async def get_songs(token: str, max_amount = -1):
#     songs = None
#     if token is not None:
#         user = await get_user(token)
#         if user is not None:
#             songs = await sql("""
#                 SELECT 
#                     s.file_exists,
#                     s.name,
#                     s.date,
#                     s.duration,
#                     s.added,
#                     s.track_id,
#                     s.yt_link,
#                     sd.artist_id,
#                     sd.album,
#                     sd.genre,
#                     sd.tags,
#                     sd.listen_time_seconds,
#                     sd.last_played,
#                     sd.img_url,
#                     a.name as artist_name,
#                     ud.favorite,
#                     ud.rating,
#                     ud.last_played as i_last_played,
#                     ud.skip_count,
#                     ud.added_to_library,
#                     ud.listen_time_seconds as my_listen_time_seconds
#                 FROM songs s
#                 LEFT JOIN songs_data sd ON sd.track_id = s.track_id
#                 LEFT JOIN artists a ON a.artist_id = sd.artist_id
#                 LEFT JOIN user_song_data ud ON ud.track_id = s.track_id AND ud.user_id = ?
#                 ORDER BY RANDOM()
#                 LIMIT ?
#             """, [user['id'], max_amount], fetch_results=True)
#     if songs is None:
#         songs = await sql("""
#                 SELECT 
#                     s.file_exists,
#                     s.name,
#                     s.date,
#                     s.duration,
#                     s.added,
#                     s.track_id,
#                     s.yt_link,
#                     sd.artist_id,
#                     sd.album,
#                     sd.genre,
#                     sd.tags,
#                     sd.listen_time_seconds,
#                     sd.last_played,
#                     sd.img_url,
#                     a.name as artist_name
#                 FROM songs s
#                 LEFT JOIN songs_data sd ON sd.track_id = s.track_id
#                 LEFT JOIN artists a ON a.artist_id = sd.artist_id
#                 ORDER BY RANDOM()
#                 LIMIT ?
#             """, [max_amount], fetch_results=True)
#     return add_random_image(format_namedtuple(songs))

# async def get_song(track_id: str, token: str):
#     song = None
#     logger.info(token)
#     if token is not None:
#         user = await get_user(token)
#         if user is not None:
#             song = await sql("""
#                 SELECT 
#                     s.file_exists,
#                     s.name,
#                     s.date,
#                     s.duration,
#                     s.added,
#                     s.track_id,
#                     s.yt_link,
#                     sd.artist_id,
#                     sd.album,
#                     sd.genre,
#                     sd.tags,
#                     sd.listen_time_seconds,
#                     sd.last_played,
#                     sd.img_url,
#                     a.name as artist_name,
#                     ud.favorite,
#                     ud.rating,
#                     ud.last_played as i_last_played,
#                     ud.skip_count,
#                     ud.added_to_library,
#                     ud.listen_time_seconds as my_listen_time_seconds
#                 FROM songs s
#                 LEFT JOIN songs_data sd ON sd.track_id = s.track_id
#                 LEFT JOIN artists a ON a.artist_id = sd.artist_id
#                 LEFT JOIN user_song_data ud ON ud.track_id = s.track_id AND ud.user_id = ?
#                 WHERE track_id
#                 LIMIT 1
#             """, [user['id'], track_id], fetch_results=True)[0]
#     if song is None:
#         song = await sql("""
#                 SELECT 
#                     s.file_exists,
#                     s.name,
#                     s.date,
#                     s.duration,
#                     s.added,
#                     s.track_id,
#                     s.yt_link,
#                     sd.artist_id,
#                     sd.album,
#                     sd.genre,
#                     sd.tags,
#                     sd.listen_time_seconds,
#                     sd.last_played,
#                     sd.img_url,
#                     a.name as artist_name
#                 FROM songs s
#                 LEFT JOIN songs_data sd ON sd.track_id = s.track_id
#                 LEFT JOIN artists a ON a.artist_id = sd.artist_id
#                 WHERE track_id = ?
#                 LIMIT 1
#             """, [track_id], fetch_results=True)[0]
#     return add_random_image(format_namedtuple(song))
# ##D --------------------------USER MUSIC---------------------------

##U -----------------------------USER------------------------------
# TODO user_song_history implementation
# user session data
@app.route('/api/set_session_data', methods=['POST'])
async def set_session_data():
    token = request.cookies.get('session_token')
    items = request.json.get('items')
    user = await get_user(token)

    if user is None:
        return jsonify({ "error": "Unauthorized" })
    
    if items is None:
        return jsonify({ "error": "Missing data" })
    
    error_count = 0

    for item in items:
        name = item.get('name')
        data = item.get('data')
        if not 'data' in item:
            logger.error(f"skipped {name} cuz its None")
            continue
        json_data = json.dumps(data)
        db_call = await sql("""
            INSERT INTO user_session_data
            (name, data, session_token)
            VALUES (?, ?, ?)
            ON CONFLICT(name, session_token)
            DO UPDATE SET data = ?
        """, [name, json_data, token, json_data], fetch_success=True)

        if not db_call:
            error_count += 1
        
    if error_count == 0:
        return jsonify({ "message": "Successfully saved data" })
    else:
        return jsonify({ "message": "Something or everything went wrong" })

@app.route('/api/get_session_data', methods=['POST'])
async def get_session_data():
    token = request.cookies.get('session_token')
    user = await get_user(token)

    if user is None:
        return jsonify({ "error": "Unauthorized" })
    
    session_data = await sql("SELECT * FROM user_session_data WHERE session_token = ?", [token], fetch_results=True)
    data = {}

    for sd in session_data:
        sd = format_namedtuple([sd], first=True)
        data[sd['name']] = json.loads(sd['data'])

    return jsonify(data)

# TODO Delete user (give 5 days for recover, before deleting user data)
# authorizing
@app.route('/api/taken', methods=['POST'])
async def is_taken():
    data = request.json
    value = data.get('value')
    exists = await sql("SELECT 1 FROM user WHERE username = ? OR email = ?", [value, value], fetch_success=True)
    return jsonify({ "exists": exists })

@app.route('/api/valid', methods=['POST'])
async def is_valid():
    value = request.json.get('value')
    value_type = request.json.get('type')

    if value_type == "email":
        matches = re.search("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", value)
        
        if matches is None:
            return jsonify({ "valid": False, "message": "Not an valid email" })
        
        taken = await sql("SELECT 1 FROM user WHERE email = ?", [value], fetch_success=True)
    elif value_type == "username":
        taken = await sql("SELECT 1 FROM user WHERE username = ?", [value], fetch_success=True)
    
    return jsonify({ "valid": not taken })

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
    
    if user is not None:
        if get_time() > user['expiry']:
            return jsonify({'success': False, 'message': 'Session expired'})
        username = user['username']
        return jsonify({'success': True, 'message': f'Access granted to {username}'})
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

# user data
@app.route('/api/user_data', methods=['POST'])
async def user_data():
    token = request.cookies.get('session_token')
    if not token:
        return jsonify({"success": False})
    
    user = await get_user(token)

    if user is not None:
        return jsonify({"success": True, "user": user})
    else:
        return jsonify({"success": False})

# Change user data
@app.route('/api/send_reset_password_code', methods=['POST'])
async def send_reset_password_code():
    token = request.cookies.get('session_token')
    user = await get_user(token)

    if user is None:
        return jsonify({ "error": "Unauthorized" })
    
    code = generate_verification_code(8)
    
    username = user['username']
    expiry = get_time(5 * 60)

    query = "INSERT INTO codes (user_id, purpose, code, expiry) VALUES (?,?,?,?)"
    sql_success = await sql(query, [user['id'], "reset_pw", code, expiry], fetch_success=True)
    if sql_success:
        send_mail = await send_email(
            user['email'],
            "Reset Password",
            f"Hello {username}, \n\nyour password reset code is: {code}\nThis code will expire in 5 minutes."
        )

        if send_mail:
            return jsonify({ "success": "Successfully send reset code" })
        else:
            return jsonify({ "error": "Error sending password reset code" })
    else:
        return jsonify({ "error": "SQL error" })

@app.route('/api/verify_reset_password_code', methods=['POST'])
async def verify_reset_password_code():
    code = request.json.get('code')
    token = request.cookies.get('session_token')
    user = await get_user(token)

    if user is None:
        return jsonify({ "error": "Unauthorized" })
    
    if code is None or len(code) < 8:
        return jsonify({ "error": "No/to short code provided" })
    
    data = await sql("SELECT expiry FROM codes WHERE user_id = ? AND purpose = ? AND code = ?", [user['id'], "reset_pw", code], fetch_results=True)
    
    if data is None or data is []:
        return jsonify({ "error": "Wrong code" })

    data = format_namedtuple(data, first=True)

    if int(data['expiry']) > get_time():
        return jsonify({ "success": "Right code" })
    else:
        return jsonify({ "error": "Code expired" })
    
@app.route('/api/change_password', methods=['POST'])
async def change_password():
    token = request.cookies.get('session_token')
    new_pw = request.json.get('newPassword')
    code = request.json.get('code')
    user = await get_user(token)

    if user is None:
        return jsonify({ "error": "Unauthorized" })
    
    if code is None or new_pw is None:
        return jsonify({ "error": "Missing data" })
    
    deleted = await sql("DELETE FROM codes WHERE purpose = ? AND code = ? AND user_id = ?", ["reset_pw", code, user['id']], fetch_success=True)

    if not deleted:
        return jsonify({ "error": "This should not happen" })
    
    hashed_password = hash_password(new_pw)

    updated_pw = await sql('UPDATE user SET password = ? WHERE id = ?', [hashed_password, user['id']], fetch_success=True)

    if updated_pw:
        return jsonify({ "success": "Successfully updated password" })
    else:
        return jsonify({ "error": "Error updating password" })


async def send_email(to_email, subject, text):
    # Email configuration
    smtp_server = "smtp.gmail.com"
    smtp_port = 465  # Changed to 465 for SSL
    sender_email = GMAIL
    sender_password = GMAIL_PASSWORD

    # Create message
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = to_email
    message["Subject"] = subject

    # Email body
    body = text
    message.attach(MIMEText(body, "plain"))

    # Send email
    try:
        smtp_client = aiosmtplib.SMTP(hostname=smtp_server, port=smtp_port, use_tls=True)
        await smtp_client.connect()
        await smtp_client.login(sender_email, sender_password)
        await smtp_client.send_message(message)
        await smtp_client.quit()
        logger.debug("Email sent successfully")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False

async def send_verification_email(to_email, username, verification_code):
    v_code = str(verification_code)
    mail = await send_email(
        to_email, 
        "Your Verification Code", 
        f"Hello {username}, \n\nyour verification code is: {v_code}\nThis code will expire in 5 minutes."
    )
    
    return mail

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
        # Cleanup expired sessions
        await sql("""
            DELETE FROM user_sessions
            WHERE expiry < CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)
        """)

        user = await sql("SELECT * FROM user WHERE username = ? OR email = ?", [username, username], fetch_results=True)
        if user is None:
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
        if user.verified:
           return {"success": False, "message": "User already verified", "verified": True}
        
        verify_code = generate_verification_code()
        username = user.username
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
        img_rel_path = get_random_img_rel_path(PROFILE_IMAGES_DIR)
        img_url = f"https://{IP_ADDRESS}:8000/api/img/{urllib.parse.quote(img_rel_path)}"
        
        created = await sql(""" 
            INSERT INTO user
            (username, email, password, created_at, verify_email_code, code_expiry, img_url, subscription)
            VALUES (?,?,?,?,?,?,?,?)
        """, [username, email, hashed_password, created_at, verify_code, code_expiry, img_url, "Echo"], fetch_success=True)
        
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
    users = await sql("""
        SELECT 
            us.expiry,
            u.id,
            u.username,
            u.email,
            u.created_at,
            u.verified,
            u.img_url,
            u.description,
            u.tags,
            u.subscription
        FROM user_sessions us
        INNER JOIN user u ON us.user_id = u.id
        WHERE us.session_token = ?
    """, [token], fetch_results=True)

    if users and users[0]:
        return format_namedtuple(users)[0]
    return None
##U -----------------------------USER------------------------------

##D ----------------------------DEVELOP----------------------------
@app.route('/api/open-search-urls', methods=['POST'])
def open_search_urls():
    data = request.json
    urls = data.get('urls')
    date = datetime.now().strftime('%Y_%m_%d_%H-%M-%S')
    path = f"./scripts/open_urls_{date}.scpt"
    n = "\n"
    t = "\t"
    script = f"""tell application "Safari"
    -- Launch Safari and bring to front
    activate
    
    -- Create a new window
    make new document
    
    -- Define the URLs you want to open
    set urlList to {"{¬" + f"{n}{t}{t}" + f",¬{n}        ".join([f'"{url}"' for url in urls]) + " ¬" + f"{n}{t}" + "}"}
    
    -- Get the window we just created
    set newWindow to window 1
    
    -- Set the first URL in the current tab
    set URL of current tab of newWindow to item 1 of urlList
    
    -- Create new tabs for the remaining URLs
    repeat with i from 2 to count of urlList
        tell newWindow
            make new tab with properties {"{URL:(item i of urlList)}"}
        end tell
    end repeat
end tell
"""

    subprocess.call(['osascript', '-e', script])
    return jsonify({ "message": "Success" })
##D ----------------------------DEVELOP----------------------------

##G -----------------------------GLOBAL----------------------------
@app.route('/api/grab-links', methods=['POST'])
async def grab_links():
    data = request.json
    queries = data.get('queries')
    if len(queries) == 0:
        return jsonify({ "error": "Missing query parameter" })
    videos = []
    times = []
    for query in queries:
        start = time.time()
        video = await search_yt(query)
        videos.append(video[0])
        times.append(time.time() - start)
        estimated_time = round(sum(times) / len(times), 2)
        logger.info(videos)
        logger.debug(f"{queries.index(query) + 1}/{len(queries)} (\033[34m{estimated_time}s\033[0m) Got data for: \033[36m{query}\033[0m (\033[34m{round(time.time() - start, 2)}s\033[0m)")

    print(videos)
    return jsonify(videos)

async def search_yt(query: str, max_results: int = 1):
    try:
        # build youtube service
        youtube = build("youtube", "v3", developerKey=GOOGLE_API_KEY)

        request = youtube.search().list(
            q=query,
            part='id,snippet',
            maxResults=max_results,
            type='video'  # Only return videos, not playlists or channels
        )
        
        response = request.execute()
        
        # Extract relevant information from each search result 
        videos = []
        for item in response['items']:
            video = {
                'video_id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description'],
                'thumbnail': item['snippet']['thumbnails']['default']['url'],
                'channel_title': item['snippet']['channelTitle'],
                'published_at': item['snippet']['publishedAt']
            }
            videos.append(video)
        
        return videos
    except HttpError as e:
        logger.error(f'An HTTP error {e.resp.status} occurred: {e.content}')
        logger.info(e.content)
        return []
    except Exception as e:
        logger.error(f'An error occurred: {str(e)}')
        return []

def get_time(add: int = 0):
    return round(time.time() * 1000) + (add * 1000)

def format_namedtuple(songs, first = False):
    named = [
        {
            field: getattr(song, field)
            for field in song._fields
        }
        for song in songs
    ]
    return named[0] if first else named

def get_random_img_rel_path(path: str):
    '''
    returns: [paths basename]/file
    '''
    for root, _, files in os.walk(path):
        length = len(files)
        random_int = math.floor(random.random() * length)
        path_basename = os.path.basename(path)
        img_path = os.path.join(root, files[random_int])
        rel_path = os.path.join(path_basename, files[random_int])
        count = 0

        while os.path.exists(img_path) == False and count < 11:
            random_int = math.floor(random.random() * length)
            img_path = os.path.join(root, files[random_int])
            rel_path = os.path.join(path_basename, files[random_int])

        return rel_path

def add_type_to_namedtuple(item_type, array):
    new_array = []
    for item in array:
        new_item = {}
        new_item['data'] = item
        new_item['type'] = item_type
        new_array.append(new_item)
    return new_array

def add_random_image(songs):
    imgs = [
        f"https://{IP_ADDRESS}:8000/api/img/Random/{file}" 
        for file in os.listdir(RANDOM_IMAGES_DIR) 
        if os.path.isfile(os.path.join(RANDOM_IMAGES_DIR, file))
    ]
    for song in songs:
        img_url = song.get('img_url')
        if img_url:
            continue
        random_int = math.floor(random.random() * len(imgs))
        song['img_url'] = imgs[random_int]
    return songs

async def sql(query: str, params=None, fetch_results=False, fetch_success=False, max_retries=5):
    for attempt in range(max_retries):
        try:
            async with aiosqlite.connect(DB_FILE) as connection:
                await connection.execute("PRAGMA foreign_keys = ON")
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
                            await connection.commit()
                            return True
                        else:
                            return bool(results)
                    else:
                        results = None
                        await connection.commit()
                return results
        except aiosqlite.OperationalError as e:
            if "database is locked" in str(e) and attempt < max_retries - 1:
                wait_time = (attempt + 1) * 0.5
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

if __name__ == '__main__':
    os.makedirs(RANDOM_IMAGES_DIR, exist_ok=True)
    os.makedirs(PROFILE_IMAGES_DIR, exist_ok=True)
    os.makedirs(NOTFOUND_IMAGES_DIR, exist_ok=True)
    exec(open("backup.py").read())
    try:
        app.run(
            host=IP_ADDRESS,
            port=8000,
            debug=True,
            ssl_context=('cert.pem', 'key.pem')
        )
    finally:
        logger.debug("Bye...")