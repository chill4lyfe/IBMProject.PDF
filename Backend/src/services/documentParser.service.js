import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import { ApiError } from "../utils/ApiError.js";

export const cleanText = (text) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
};

export const parseDocument = async (filePath, mimeType) => {
  try {
    if (!filePath) throw new ApiError(400, "File path is missing");

    const buffer = await fs.readFile(filePath);
    let extractedText = "";
    let pageCount = 0;

    switch (mimeType) {
      case "application/pdf":
        // Using your original PDFParse class logic
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        
        extractedText = data.text;
        pageCount = data.total || 0; 
        
        await parser.destroy(); // Properly clean up the parser memory
        break;

      case "text/plain":
      case "text/markdown":
      case "application/md":
      case "text/csv":
        extractedText = buffer.toString("utf-8");
        pageCount = 0;
        break;

      default:
        throw new ApiError(415, `Unsupported file format. Received: ${mimeType}`);
    }

    const cleanedText = cleanText(extractedText);

    // Housekeeping
    await fs.unlink(filePath);

    return { text: cleanedText, pageCount };
  } catch (error) {
    if (filePath) {
      await fs.unlink(filePath).catch(() => console.log("Silent cleanup failure"));
    }
    
    console.error("Error in parseDocument:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to parse document content");
  }
};