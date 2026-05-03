import psycopg2
from psycopg2.extras import RealDictCursor
import os
import logging
import asyncio

logger = logging.getLogger(__name__)

# 🗄️ Database config (use env var in production)
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:thor130@127.0.0.1:5433/face_detection")


def get_connection():
    """🔌 Get a new PostgreSQL connection"""
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return None


def init_db():
    """🔌 Initialize PostgreSQL table"""
    logger.info("⏳ Attempting to connect to PostgreSQL Database...")
    conn = get_connection()
    if not conn:
        return
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS roi_data (
                    id SERIAL PRIMARY KEY,
                    x INTEGER,
                    y INTEGER,
                    width INTEGER,
                    height INTEGER,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
        logger.info("✅ Database connected & initialized successfully 🗄️🚀")
    except Exception as e:
        logger.error(f"❌ DB Init Error: {e}")
    finally:
        conn.close()


def insert_roi_sync(x: int, y: int, w: int, h: int):
    """💾 Synchronous database insert"""
    conn = get_connection()
    if not conn:
        return
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO roi_data (x, y, width, height) VALUES (%s, %s, %s, %s)",
                (x, y, w, h)
            )
            conn.commit()
    except Exception as e:
        logger.error(f"DB Insert Error: {e}")
    finally:
        conn.close()


async def insert_roi(x: int, y: int, w: int, h: int):
    """💾 Save ROI coordinates to the database asynchronously"""
    await asyncio.to_thread(insert_roi_sync, x, y, w, h)


def get_roi_history_sync():
    """📋 Synchronous fetch recent ROI history"""
    conn = get_connection()
    if not conn:
        return []
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT x, y, width, height, timestamp FROM roi_data ORDER BY timestamp DESC LIMIT 50")
            return cur.fetchall()
    except Exception as e:
        logger.error(f"DB Fetch Error: {e}")
        return []
    finally:
        conn.close()


async def get_roi_history():
    return await asyncio.to_thread(get_roi_history_sync)
