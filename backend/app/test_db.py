import psycopg2

try:
    conn = psycopg2.connect(
        dbname="face_detection",
        user="postgres",
        password="thor130",
        host="127.0.0.1",
        port="5433"  # 🔥 FIXED
    )
    print("✅ Connected successfully")
    conn.close()
except Exception as e:
    print("❌ Failed:", e)
