# 🚀 Helper by Rocket

> **Meet our Multi-Format Document AI Workspace.**

Helper is not just another ChatGPT wrapper. It is a premium, zero-auth, multi-session AI workspace designed to leverage the absolute power of Large Context Language Models through a **Long-Context LLM Pipeline**.

Instead of relying on traditional Retrieval-Augmented Generation (RAG), which chunks documents into smaller pieces and increases API requests, HELPER utilizes a **Brute-Force Context Architecture**. Entire documents are loaded directly into the model's context window, enabling deeper reasoning, better contextual understanding, and significantly improved document analysis.

---

# ✨ UI / UX Experience

The interface is carefully designed to provide an enterprise-grade AI workspace.

- 🎨 Premium royal deep-green minimalistic theme
- 📂 Three-pane contextual workspace
- 💬 Multi-session chat management
- 📄 Active document management
- 🔒 Zero authentication required
- ⚡ Real-time AI streaming
- 🧠 Beautiful rendering of Markdown, code blocks and tables
- 📝 Local session management for better privacy

---

# 🚀 Core Features

- ⚡ **Real-Time SSE Streaming**
  - Watch AI generate responses in real-time.

- 📊 **Dynamic Token Tracking**
  - Live token usage monitoring.

- 🔄 **Concurrent Operations**
  - MongoDB atomic operations ensure token consistency.

- 📄 **Seamless Chat Transfer**
  - Export chat history into Markdown and continue conversations in a new session.

- 🎭 **Persona Selector**
  - Customize AI behavior using predefined personas.

- 📚 **Long Context Document Analysis**
  - Entire documents are sent directly into Gemini's large context window for advanced reasoning.

---

# 🛠 Tech Stack

## Frontend

- React (Vite)
- Tailwind CSS v4

## Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- Google Gemini API
- Multer

## DevOps

- Docker
- Docker Compose

---

# 📋 Requirements

Before running the project, make sure you have:

- Docker Desktop
- Node.js 22+ (only required for manual setup)
- Git
- Google Gemini API Key

---

# 📁 Project Structure

```text
IBMProject.PDF
│
├── Backend
│   ├── src
│   ├── uploads
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── server.js
│
├── Frontend
│   ├── src
│   ├── public
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
```

---

# ⚙️ Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/chill4lyfe/IBMProject.PDF.git

cd IBMProject.PDF
```

---

## 2. Environment Setup

Create a `.env` file inside the **Backend** folder.

```env
PORT=8000
NODE_ENV=development
GEMINI_API_KEY=<YOUR_GOOGLE_GEMINI_API_KEY>
CHAT_MODEL=gemini-3.1-flash-lite
MONGODB_URI=mongodb://mongo:27017/askpdf
```

---

# 🐳 Docker Setup (Recommended)

Docker is the recommended way to run the project.

### Step 1

Install **Docker Desktop**

- Windows
- macOS
- Linux

> Windows users should enable **WSL2** and keep **Linux Containers** enabled.

---

### Step 2

Start Docker Desktop.

Wait until Docker Engine is running.

---

### Step 3

From the project root, run

```bash
docker compose up --build
```

Docker will automatically start

- Frontend
- Backend
- MongoDB Atlas Local

---

### Step 4

Open your browser

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:8000
```

---

# 💻 Manual Development Setup (Without Docker)

If you prefer running everything locally:

## Install dependencies

### Backend

```bash
cd Backend

npm install
```

### Frontend

```bash
cd ../Frontend

npm install
```

---

### Start MongoDB Atlas Local

```bash
docker run -d --name local-mongo -p 27017:27017 mongodb/mongodb-atlas-local:latest
```

---

### Run Backend

```bash
cd Backend

npm run dev
```

---

### Run Frontend

```bash
cd Frontend

npm run dev
```

Open

```
http://localhost:5173
```

---

# 🔥 Development Workflow

Frontend uses

- Vite Hot Reload

Backend uses

- Nodemon

After editing your source code, changes automatically reload.

No need to rebuild Docker images for normal code changes.

---

# 🐳 Useful Docker Commands

## Start

```bash
docker compose up
```

---

## Start in Background

```bash
docker compose up -d
```

---

## Rebuild Images

```bash
docker compose up --build
```

---

## Stop

```bash
docker compose down
```

---

## Restart

```bash
docker compose restart
```

---

## View Logs

```bash
docker compose logs -f
```

---

# 🌐 Application Architecture

```text
                Browser
                   │
                   ▼
        React Frontend (5173)
                   │
                   ▼
       Express Backend (8000)
                   │
                   ▼
        MongoDB Atlas Local
              (27017)
```

---

# 🔐 Environment Variables

| Variable | Description |
|-----------|-------------|
| PORT | Backend server port |
| NODE_ENV | Development environment |
| GEMINI_API_KEY | Google Gemini API Key |
| CHAT_MODEL | Gemini model used |
| MONGODB_URI | MongoDB connection string |

---

# 🛠 Troubleshooting

## Docker not running

Start Docker Desktop before executing

```bash
docker compose up
```

---

## Port already in use

Find the process

```bash
netstat -ano | findstr :8000
```

Terminate it

```bash
taskkill /PID <PID> /F
```

---

## Rebuild containers

```bash
docker compose down

docker compose up --build
```

---

# 🚀 Future Roadmap

Future updates will focus on scalability and cost efficiency.

### Context Caching

Implement Google's Context Caching API to reduce latency and API costs.

---

### Hybrid Local RAG

- HuggingFace Embeddings
- Local Vector Database
- Hybrid Retrieval Pipeline

---

# 👨‍💻 Team

Built with ❤️ by **Team Rocket**

IBM SkillsBuild Project

---

# 📄 License

This project is licensed under the **GNU General Public License v3.0**.

See the [LICENSE](LICENSE) file for more details.