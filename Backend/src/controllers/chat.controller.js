import { Session } from "../models/session.model.js";
import { buildPrompt, streamAnswer } from "../services/llm.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  saveMessage,
  getHistory,
  deleteHistory,
} from "../services/history.service.js";

export const askQuestion = asyncHandler(async (req, res) => {
  const { question, sessionId } = req.body;

  if (!sessionId || !question || question.trim() === "") {
    throw new ApiError(400, "Session ID and question are required");
  }

  // 1. Fetch Session and all attached Documents
  const session = await Session.findById(sessionId).populate("documents");

  if (!session) {
    throw new ApiError(404, "Workspace session not found");
  }

  // 2. Fetch Conversation History (this keeps the AI's memory intact!)
  const history = await getHistory(sessionId);

  // 3. Assemble the prompt payload (Document texts + Chat history)
  const prompt = buildPrompt(question, session.documents, history);

  // 4. Send request to LLM
  const stream = await streamAnswer(prompt);

  // 5. Configure standard SSE headers for the frontend stream
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullAnswer = "";

  try {
    for await (const chunk of stream) {
      if (chunk.text) {
        fullAnswer += chunk.text;
        res.write(
          `data: ${JSON.stringify({
            content: chunk.text,
          })}\n\n`
        );
      }
    }

    // 6. Save the conversation exchange for future turns
    await saveMessage(sessionId, "user", question);
    await saveMessage(sessionId, "model", fullAnswer);

    // End stream safely (we removed 'sources' chunk array, AI cites inline now)
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(
      `data: ${JSON.stringify({
        error: "An error occurred while generating the response.",
      })}\n\n`
    );
  } finally {
    res.end();
  }
});

export const history = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const historyData = await getHistory(sessionId);
  res.status(200).json(new ApiResponse(200, { history: historyData }, "History retrieved"));
});

export const delHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  await deleteHistory(sessionId);
  res.status(200).json(new ApiResponse(200, {}, "History deleted"));
});