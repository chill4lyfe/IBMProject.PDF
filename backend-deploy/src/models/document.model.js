import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    extractedText: { type: String, default: "" },
    pageCount: { type: Number, default: 0 },
    tokenCount: { type: Number, default: 0 },
    status: { type: String, enum: ["processing", "ready", "failed"], default: "processing",},
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);