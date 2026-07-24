import express from "express";
import cors from "cors";

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

// 2. Stability: Increase JSON payload limits for massive AI context windows
// Without this, sending large chat histories back to the server will throw a 413 error.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Helper Backend is running!",
  });
});

import documentRouter from "./routes/document.route.js";
import chatRouter from "./routes/chat.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

app.use("/api/documents", documentRouter);
app.use("/api/chat", chatRouter);

// Global Error Handler (Must be the last middleware)
app.use(errorHandler);

export { app };