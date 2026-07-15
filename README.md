Below is the refactored and restructured README for the AskPDF project.

---

# AskPDF: RAG-Powered Document Q&A System

AskPDF is a production-ready RESTful backend API designed for Retrieval-Augmented Generation (RAG). It enables users to upload PDF documents and engage in real-time, grounded Q&A sessions. The system handles text extraction, recursive chunking, semantic embedding via the Google Gemini API, and vector search through MongoDB Atlas to deliver accurate, hallucination-free responses.

## Key Features

* **PDF Ingestion:** Supports uploads up to 200 pages or 20MB. Documents are parsed and cleaned automatically via background processing.
* **Recursive Chunking:** Splits text based on logical boundaries (paragraphs, sentences, or words) with configurable overlap to maintain context.
* **Semantic Vector Embeddings:** Utilizes the Google Gemini `text-embedding-004` model to generate 768-dimensional semantic embeddings.
* **Vector Search:** Employs MongoDB Atlas `$vectorSearch` for efficient retrieval using cosine similarity and metadata filtering.
* **Streaming Responses:** Provides low-latency, word-by-word streaming using Server-Sent Events (SSE) and the `gemini-3.0-flash` model.
* **Conversation Memory:** Maintains multi-turn context using Redis Lists.
* **Rate Limiting:** Protects the Gemini API via a fixed-window counter (20 requests per minute per IP).
* **Background Processing:** Executes non-blocking PDF processing using Redis `LPUSH`/`BRPOP` queues.
* **Hallucination Prevention:** Implements strict system prompting and similarity thresholding to ensure responses are derived exclusively from the source document.

## System Architecture

### Document Ingestion Flow

1. **Upload:** PDF is uploaded via Multer.
2. **Queueing:** Document status is set to `processing`, and a job is pushed to the Redis queue.
3. **Worker:** A background worker performs text parsing, cleaning, and recursive chunking.
4. **Storage:** Embeddings are generated via Gemini and bulk-inserted into MongoDB; status is updated to `ready`.

### Query & RAG Flow

1. **Request:** User question is validated against rate limits.
2. **Context:** Chat history is retrieved from Redis.
3. **Search:** The question is embedded, and MongoDB Atlas performs a vector search for the top 5 relevant chunks.
4. **Generation:** A prompt containing context, history, and the user's question is sent to the Gemini Chat API.
5. **Streaming:** Responses are streamed via SSE to the client and saved to the conversation history.

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB Atlas |
| **Cache & Queue** | Redis (ioredis) |
| **AI SDK** | `@google/genai` |
| **Embeddings** | `text-embedding-004` |
| **Chat LLM** | `gemini-3.0-flash` |
| **Parsing** | `pdf-parse`, `multer` |

## API Endpoints

### Documents (`/api/documents`)

* `POST /upload`: Upload a PDF. Returns a Job ID.
* `GET /`: Retrieve a paginated list of uploaded documents.
* `GET /:id`: Get document details and processing status.
* `DELETE /:id`: Remove a document, its chunks, and associated caches.

### Chat (`/api/chat`)

* `POST /ask`: Submit a question. Returns an SSE stream.
* `GET /history/:sessionId`: Retrieve history for a session.
* `DELETE /history/:sessionId`: Clear session history.

### Jobs (`/api/jobs`)

* `GET /:jobId`: Poll background worker status (e.g., `parsing`, `chunking`, `completed`).

## Getting Started

### Prerequisites

* Node.js (v20.6+)
* MongoDB Atlas account (with a configured Vector Search index)
* Redis server
* Google Gemini API Key

### Installation

```bash
git clone <repository-url>
cd <project-directory>
npm install
mkdir -p uploads && touch uploads/.gitkeep

```

### Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database_name
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key

```

### MongoDB Vector Index Setup

Create a Search Index named `vector_index` on the `chunks` collection in MongoDB Atlas:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}

```

### Execution

```bash
npm run dev

```

## Engineering Decisions

* **Redis Queues:** `BRPOP` provides a lightweight, blocking mechanism for background tasks without the complexity of traditional message brokers.
* **Cosine Similarity:** Selected for its effectiveness in semantic text matching, regardless of variations in text length.
* **Server-Sent Events (SSE):** Utilized to stream LLM tokens to the client as they are generated, enhancing perceived performance and user experience.