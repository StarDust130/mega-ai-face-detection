from fastapi import FastAPI  # type: ignore
from app.websocket import router as websocket_router
from app.db import init_db

app = FastAPI(title="Face Detection API")


@app.on_event("startup")
def startup_event():
    # 🏁 Startup tasks
    init_db()


# 🔗 Include WebSocket endpoints
app.include_router(websocket_router)


@app.get("/")
def home():
    return {"message": "Backend running 🚀"}
