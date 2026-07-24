import { asyncHandler } from "../utils/asyncHandler.js";
import { Document } from "../models/document.model.js";
import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parseDocument } from "../services/documentParser.service.js";
import { countTokens } from "../services/llm.service.js";

export const uploadDocument = asyncHandler(async (req, res) => {
  const filePath = req.file?.path;
  let { sessionId } = req.body; 

  if (!filePath) throw new ApiError(400, "File is missing");
  
  let session;
  if (sessionId) {
    session = await Session.findById(sessionId);
    if (!session) throw new ApiError(404, "Session not found");
    if (session.documents.length >= 4) {
      throw new ApiError(400, "Maximum of 4 documents allowed per session.");
    }
  } else {
    session = await Session.create({ title: "New Workspace" });
    sessionId = session._id.toString();
  }

  const { text, pageCount } = await parseDocument(filePath, req.file.mimetype);
  const tokenCount = await countTokens(text);

  // Enforce limit before database write
  if (session.totalTokens + tokenCount > 190000) {
    throw new ApiError(400, "Adding this document exceeds the 190,000 token limit for this workspace.");
  }

  const document = await Document.create({
    fileName: req.file.filename,
    originalName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    pageCount,
    extractedText: text,
    tokenCount,
    status: "ready",
  });

  // ATOMIC UPDATE: Prevents concurrent upload race conditions
  const updatedSession = await Session.findByIdAndUpdate(
    sessionId, 
    {
      $push: { documents: document._id },
      $inc: { documentTokens: tokenCount, totalTokens: tokenCount }
    },
    { returnDocument: 'after' }
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        sessionId: updatedSession._id,
        document: {
          id: document._id,
          originalName: document.originalName,
          status: document.status,
          tokenCount: document.tokenCount
        },
        sessionTokens: updatedSession.totalTokens
      },
      "File processed and attached to session successfully"
    )
  );
});

export const getSessionDocuments = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId).populate("documents", "-extractedText");

  if (!session) throw new ApiError(404, "Session not found");
  res.status(200).json(new ApiResponse(200, { 
    documents: session.documents,
    totalTokens: session.totalTokens || 0
  }, "Documents retrieved"));
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.body;

  const document = await Document.findByIdAndDelete(id);
  if (!document) throw new ApiError(404, "Document Not Found");

  if (sessionId) {
    await Session.findByIdAndUpdate(
      sessionId, 
      {
        $pull: { documents: id },
        $inc: { 
          documentTokens: -Math.abs(document.tokenCount), 
          totalTokens: -Math.abs(document.tokenCount) 
        }
      }
    );
  }

  res.status(200).json(new ApiResponse(200, {}, "Document removed from Workspace"));
});