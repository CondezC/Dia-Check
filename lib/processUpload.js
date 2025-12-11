import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function processUpload({ file, base64 }) {
  try {
    // ---------------------------------------------------------
    // 1. Load ENV
    // ---------------------------------------------------------
    const MODEL_ID = process.env.MODEL_ID || process.env.ROBOFLOW_MODEL_ID;
    const API_KEY = process.env.API_KEY || process.env.ROBOFLOW_API_KEY;
    const API_URL = process.env.API_URL || process.env.ROBOFLOW_API_URL;

    if (!MODEL_ID || !API_KEY || !API_URL) {
      throw new Error("Missing Roboflow environment variables.");
    }

    console.log("🧪 DEBUG ENV:", { MODEL_ID, API_KEY, API_URL });

    // ---------------------------------------------------------
    // 2. Get image base64 (from file OR direct base64)
    // ---------------------------------------------------------
    let imageBase64;

    if (base64) {
      // JSON upload already provided base64
      imageBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
    } else if (file) {
      // Formidable upload mode
      const buffer = fs.readFileSync(file.filepath);    // ✔ correct path
      imageBase64 = buffer.toString("base64");
    } else {
      throw new Error("No image provided.");
    }

    // ---------------------------------------------------------
    // 3. Send to Roboflow
    // ---------------------------------------------------------
    const url = `${API_URL}/${MODEL_ID}?api_key=${API_KEY}`;

    const response = await axios({
      method: "POST",
      url,
      data: imageBase64,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    });

    console.log("📡 ROBOFLOW RESPONSE:", response.data);

    // ---------------------------------------------------------
    // 4. Safely remove tmp file if exists (Vercel-friendly)
    // ---------------------------------------------------------
    if (file?.filepath && fs.existsSync(file.filepath)) {
      fs.unlinkSync(file.filepath);
    }

    // ---------------------------------------------------------
    // 5. Return classification
    // ---------------------------------------------------------
    return response.data;

  } catch (error) {
    console.error("❌ ROBOFLOW ERROR:", error.response?.data || error);
    throw new Error("Roboflow processing failed.");
  }
}
