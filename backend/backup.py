# -*- coding: utf-8 -*-
import asyncio
from datetime import datetime, timedelta
import os
import shutil
from dotenv import load_dotenv # type: ignore

# Load environment variables from .env file
load_dotenv()

ROOT_PATH = os.environ.get("ROOT_PATH")
ENV_DIR = f"{ROOT_PATH}{os.environ.get('ENV_DIR')}"
DB_FILE = f"{ENV_DIR}/data/music.db"
BACKUPS_DIR = f"{ENV_DIR}/backups"

def backup_name(date) -> str:
  return f"db backup {date:%d_%m_%Y}.db"

async def backup():
  print(f"Backup DB file")
  basename = os.path.basename(DB_FILE)
  
  # Copy current db file into backups
  shutil.copy(DB_FILE, BACKUPS_DIR)

  date = datetime.now()
  # Rename the copied file
  os.rename(os.path.join(BACKUPS_DIR, basename), os.path.join(BACKUPS_DIR, backup_name(date)))

  # get backup path from 3 days ago
  delete_backup = os.path.join(BACKUPS_DIR, backup_name(datetime.now() - timedelta(days=3)))

  # delete backup from 3 days ago if it exists
  if os.path.exists(delete_backup):
    os.remove(delete_backup)

  

if __name__ == '__main__':
  asyncio.run(backup())