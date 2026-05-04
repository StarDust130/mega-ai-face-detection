# 🎬 Mega AI Face Detection

<video width="100%" autoplay muted loop>
  <source src="./frontend/public/bg.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

> Show your face, get AI-powered compliments! ✨ Real-time face detection with WebSocket streaming.

**[🌐 Live](https://mega-ai-face-detection.vercel.app/)** • **[⭐ Code](https://github.com/StarDust130/mega-ai-face-detection)** • **[👤 Creator](https://chandrashekhar.me)**

---

---

## ✨ What It Does

1. **📹 Camera** → Capture your face
2. **⚡ WebSocket** → Send 30 FPS frames
3. **👁️ AI Detection** → MediaPipe finds your face
4. **🎯 Bounding Box** → Draw rectangle around face
5. **💾 Save Data** → Store coordinates in database
6. **🎉 Compliments** → AI praise every 3-5 seconds

---
## 🏗️ Architecture

![Architecture](./frontend/public/architecture.png)

---

## 🛠️ Tech Used

- **Frontend**: Next.js 16 + React 19 + Tailwind
- **Backend**: FastAPI + Python 3.10
- **Database**: PostgreSQL (Supabase)
- **AI**: Google MediaPipe
- **Deploy**: Vercel + DigitalOcean + Supabase

---

## 🚀 5-Minute Setup <img src="./frontend/public/run.webp" width="30" style="display:inline-block; margin-left:8px;" />

### Docker (Easiest)

```bash
git clone https://github.com/StarDust130/mega-ai-face-detection.git
cd mega-ai-face-detection
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL
docker-compose up --build
# Open http://localhost:3000
```

### Local Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## 📝 .env Example

```env
# Get this from Supabase.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXT_PUBLIC_API_URL=ws://localhost:8000
```



---

## ✅ Testing

**Backend working?**

```bash
curl http://localhost:8000
# Shows: {"message":"Backend running 🚀"}
```

**Frontend working?**

- Go to http://localhost:3000
- Click "Start Camera"
- Show your face
- See bounding box + compliments ✨

![Dance](./frontend/public/dance.gif)

**Database working?**

```bash
psql $DATABASE_URL
SELECT * FROM roi_data LIMIT 5;
```

---

## 🚀 Deploy

**Vercel (Frontend)**

1. Push to GitHub
2. Connect on Vercel
3. Deploy ✅

**DigitalOcean (Backend)**

1. Create App Platform app
2. Connect GitHub repo
3. Add env vars, deploy ✅

**Supabase (Database)**

1. Create project
2. Copy connection string
3. Add to `.env` ✅

---

## 🤖 AI Used

- **GitHub Copilot** - WebSocket, React patterns
- **Claude** - Architecture, docs

---

## ⭐ Like It?

- [⭐ Star](https://github.com/StarDust130/mega-ai-face-detection)
- [🔗 Share](https://mega-ai-face-detection.vercel.app/)
- [👤 Portfolio](https://chandrashekhar.me)

```
Made with ❤️ by Chandrashekhar
```
