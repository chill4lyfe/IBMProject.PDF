import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

import documentRouter from "./routes/document.route.js";
import chatRouter from "./routes/chat.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

app.use("/api/documents", documentRouter);
app.use("/api/chat", chatRouter);

app.use(errorHandler);

export { app };