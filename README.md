# Helper by Rocket
**Meet our Multi-Format Document AI Workspace.**

Helper is not just another ChatGPT wrapper. It is a premium, zero-auth, multi-session AI workspace designed to leverage the absolute power of large token context AIs by implementing **Long-Context LLM Pipeline**.

We didn't rely on traditional RAG, because of its chunking of large scale documents, we were directly hitting too many requests on the free tier. To leverage the million tokens context windows that we now get for free, our HELPER uses a **Brute-Force Context Architecture**. It feeds your entire document, directly into the AI's memory, allowing for unparalleled complex reasoning and deep document analysis.

---

## UI/UX Experience
UI/UX is carefully crafted to create a workspace that feels like a high-end, enterprise-grade tool:
- A custom, premium looking,  minimalistic royal deep-green theme.
- Seamlessly manage your chat history, active workspace documents, and global sessions with a 3-Pane Contextual Layout.
- No logins required. Your sessions are managed locally while all your documents are safely processed on the backend. No document survives in the server so the data is strictly between the user and AI.
- Experience fluid & polished interaction. Renders complex AI responses, code blocks, and tables beautifully.

---

## Core Features

*   **Real-Time SSE Streaming:** Watch the AI think and type in real-time.
*   **Dynamic Token Tracking:** A real-time progress pill tracks your exact context footprint.
*   **Concurrent Operations:** The backend uses MongoDB atomic operations to ensure token math never breaks.
*   **Seamless Chat Transfer:** Automatically get a perfectly engineered `.md` export of your chat history after the session limit is reached. Just drop it into a new session & continue fresh.
*   **Persona Selector:** Increase efficiency & response quality by  letting AI adopt specific personas.

---

## Tech Stack
**Frontend:**
*   React (Vite)
*   Tailwind CSS v4 (Custom  architectures)

**Backend:**
*   Node.js & Express
*   MongoDB & Mongoose
*   Google Gemini API
*   Multer (Document handling)

---

## Getting Started

### 1. Clone & Install
```powershell
git clone https://github.com/chill4lyfe/IBMProject.PDF.git
cd askpdf

# Install Backend
cd Backend
npm install

# Install Frontend
cd ../Frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in your `Backend` folder:
```env
PORT=8000
NODE_ENV=development
GEMINI_API_KEY=<enter_your_google_gemini_api_key>
CHAT_MODEL="gemini-3.1-flash-lite"
MONGODB_URI=mongodb://127.0.0.1:27017/askpdf?directConnection=true
```
### 3. Docker Setup
- Install Docker (windows/linux/mac) [for windows check WSL2 and keep windows containers unchecked while setup]
- open terminal and run this command:
```
docker run -d --name local-mongo -p 27017:27017 mongodb/mongodb-atlas-local:latest
```
(u'll be able to see local:mongo live and running in the docker application...keep it running till the site is functioning.)

### 4. Run the Workspace
Open two terminals.

**Terminal 1 (Backend):**
```bash
cd Backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm run dev
```
Visit `http://localhost:5173` and start chatting!

---

## Future Roadmap
Future updates will focus on scale and cost-efficiency:
*   **IMP: Context Caching:** Implementing Google's Caching API to store massive documents on the server and getting only a cache-id, dropping latency and API costs by 70%.
*   **Local Sovereign RAG:** Introducing local embedding models (HuggingFace) and a local Vector DB to create a hybrid offline-retrieval pipeline for infinite scaling.

---
*Built by Team Rocket. IBM SkillsBuild*

## License
This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.