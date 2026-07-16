// src/services/llm.service.js
import { ai } from "../config/gemini.js";

const CHAT_MODEL = process.env.CHAT_MODEL || "gemini-flash-lite-latest";

const SYSTEM_INSTRUCTION = `You are a highly capable document analysis assistant. Your job is to answer the user's questions based ONLY on the provided context from the uploaded documents.
Rules:
1. Answer ONLY using the information present in the provided documents. If the answer is not in the documents, clearly state: "I couldn't find this information in the uploaded document(s)."
2. Do NOT use outside knowledge o rmake up random facts by yourself.
3. Always cite your sources by referencing the file name in brackets, e.g., [budget.pdf] or [notes.md], whenever you state a fact from that document.
4. Be concise, well-formatted, and use markdown (bullet points, bold text) for readability.
5. Structure your wording as humane by prioritizing natural, conversational flow by varying sentence length and structure to mimic professional human helper.`;

export const buildPrompt = (question, documents, history = []) => {
  let contextString = "";

  if (documents && documents.length > 0) {
    contextString += "--- START OF WORKSPACE DOCUMENTS ---\n";
    for (const doc of documents) {
      contextString += `\n--- Document: ${doc.originalName} ---\n`;
      contextString += doc.extractedText;
      contextString += `\n--- End of ${doc.originalName} ---\n`;
    }
    contextString += "\n--- END OF WORKSPACE DOCUMENTS ---\n";
  } else {
    contextString = "No documents have been uploaded for this session yet. Remind the user they can ask general questions or upload files to begin.";
  }

  // The huge document payload is passed as system instructions, separate from chat history
  const systemInstructionWithContext = `${SYSTEM_INSTRUCTION}\n\n${contextString}`;

  return {
    systemInstruction: systemInstructionWithContext,
    userMessage: question,
    history,
  };
};

export const streamAnswer = async (promptData) => {
  let finalContents = [];

  // Re-inject previous conversation memory!
  for (let i = 0; i < promptData.history.length; i++) {
    let oldMessage = promptData.history[i];
    finalContents.push({
      role: oldMessage.role === "model" ? "model" : "user", // Strict role mapping for Gemini
      parts: [{ text: oldMessage.content }],
    });
  }

  // Add the newest user question
  finalContents.push({
    role: "user",
    parts: [{ text: promptData.userMessage }],
  });

  const stream = await ai.models.generateContentStream({
    model: CHAT_MODEL,
    contents: finalContents,
    config: {
      systemInstruction: promptData.systemInstruction,
      temperature: 0.2,
    },
  });
  
  return stream;
};