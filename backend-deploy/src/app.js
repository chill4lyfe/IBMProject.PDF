import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Helper Backend is running 🚀",
  });
});

import documentRouter from "./routes/document.route.js";
import chatRouter from "./routes/chat.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

app.use("/api/documents", documentRouter);
app.use("/api/chat", chatRouter);

app.use(errorHandler);

export { app };