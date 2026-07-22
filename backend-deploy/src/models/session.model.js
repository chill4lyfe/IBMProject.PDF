import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "New Workspace" },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    history: [
      {
        role: { type: String, enum: ["user", "model"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      }
    ],
    
    // NEW: Token tracking for the 500k Cap
    documentTokens: { type: Number, default: 0 },
    historyTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "archived", "error"],
      default: "active",
    },
  },
  { timestamps: true }
);
sessionSchema.index({ createdAt: -1 });
export const Session = mongoose.model("Session", sessionSchema);