import { Session } from "../models/session.model.js";
import { buildPrompt, streamAnswer, countTokens } from "../services/llm.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { saveMessage, getHistory, deleteHistory } from "../services/history.service.js";

export const askQuestion = asyncHandler(async (req, res) => {
  const { question, sessionId, persona } = req.body;

  if (!sessionId || !question || question.trim() === "") {
    throw new ApiError(400, "Session ID and question are required");
  }

  const session = await Session.findById(sessionId).populate("documents");
  if (!session) throw new ApiError(404, "Workspace session not found");

  // NEW: Enforce 256k Cap before asking LLM
  if (session.totalTokens >= 256000) {
    // We throw a specific 403 error. The frontend will catch this and show the "Generate Summary" UI.
    throw new ApiError(403, "CONTEXT_LIMIT_REACHED");
  }

  const history = await getHistory(sessionId);
  const prompt = buildPrompt(question, session.documents, history, persona);
  const stream = await streamAnswer(prompt);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullAnswer = "";
  let streamUsageMetadata = null; // Track exact usage from Gemini

  try {
    for await (const chunk of stream) {
      if (chunk.text) {
        fullAnswer += chunk.text;
        res.write(`data: ${JSON.stringify({ content: chunk.text })}\n\n`);
      }
      // Capture usage metadata if it exists in the chunk
      if (chunk.usageMetadata) {
        streamUsageMetadata = chunk.usageMetadata;
      }
    }

    await saveMessage(sessionId, "user", question);
    await saveMessage(sessionId, "model", fullAnswer);

    let finalTotalTokens = session.totalTokens;

    // ATOMIC UPDATE: Dynamic Token Counts
    if (streamUsageMetadata && streamUsageMetadata.totalTokenCount) {
      finalTotalTokens = streamUsageMetadata.totalTokenCount;
      const calculatedHistoryTokens = Math.max(0, finalTotalTokens - session.documentTokens);
      
      await Session.findByIdAndUpdate(sessionId, {
        $set: { 
          totalTokens: finalTotalTokens, 
          historyTokens: calculatedHistoryTokens 
        }
      });
    } else {
      const newTokens = await countTokens(question + "\n" + fullAnswer);
      finalTotalTokens = session.totalTokens + newTokens;
      
      await Session.findByIdAndUpdate(sessionId, {
        $inc: { 
          historyTokens: newTokens, 
          totalTokens: newTokens 
        }
      });
    }

    // Send the updated totalTokens to the frontend progress bar
    res.write(`data: ${JSON.stringify({ done: true, totalTokens: finalTotalTokens })}\n\n`);
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "An error occurred while generating the response." })}\n\n`);
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