import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Workspace",
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    history: [
      {
        role: { type: String, enum: ["user", "model"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      }
    ],
    status: {
      type: String,
      enum: ["active", "archived", "error"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ createdAt: -1 });

export const Session = mongoose.model("Session", sessionSchema);