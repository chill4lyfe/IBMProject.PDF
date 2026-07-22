import express from "express";
import {
  uploadDocument,
  getSessionDocuments,
  deleteDocument,
} from "../controllers/document.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();
// changed 'pdf' to 'file'
router.post("/upload", upload.single("file"), uploadDocument);
router.get("/session/:sessionId", getSessionDocuments);
router.delete("/:id", deleteDocument);

export default router;