// src/controllers/document.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { Document } from "../models/document.model.js";
import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parseDocument } from "../services/documentParser.service.js";

export const uploadDocument = asyncHandler(async (req, res) => {
  const filePath = req.file?.path;
  let { sessionId } = req.body; 

  if (!filePath) throw new ApiError(400, "File is missing");
  let session;
  if (sessionId) {
    session = await Session.findById(sessionId);
    if (!session) throw new ApiError(404, "Session not found");
    if (session.documents.length >= 5) {
      throw new ApiError(400, "Maximum of 5 documents allowed per session.");
    }
  } else {
    session = await Session.create({ title: "New Workspace" });
    sessionId = session._id.toString();
  }
  const { text, pageCount } = await parseDocument(filePath, req.file.mimetype);
  // Save Document with Extracted Text
  const document = await Document.create({
    fileName: req.file.filename,
    originalName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    pageCount,
    extractedText: text, // The massive string for the 1M token window
    status: "ready",
  });
  session.documents.push(document._id);
  await session.save();

  res.status(201).json(
    new ApiResponse(
      201,
      {
        sessionId: session._id,
        document: {
          id: document._id,
          originalName: document.originalName,
          status: document.status
        }
      },
      "File processed and attached to session successfully"
    ),
  );
});

export const getSessionDocuments = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId).populate("documents", "-extractedText");

  if (!session) throw new ApiError(404, "Session not found");

  res.status(200).json(new ApiResponse(200, { documents: session.documents }, "Documents retrieved"));
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.body;

  const document = await Document.findByIdAndDelete(id);
  if (!document) throw new ApiError(404, "Document not found");

  if (sessionId) {
    await Session.findByIdAndUpdate(sessionId, {
      $pull: { documents: id }
    });
  }

  res.status(200).json(new ApiResponse(200, {}, "Document removed from Workspace"));
});