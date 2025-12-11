import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function processUpload({ file }) {
  try {
    // --------------------------------------------
    // ✅ 1. Validate env vars
    // --------------------------------------------
    const MODEL_ID = process.env.MODEL_ID || process.env.ROBOFLOW_MODEL_ID;
    const API_KEY = process.env.API_KEY || process.env.ROBOFLOW_API_KEY;
    const API_URL = process.env.API_URL || process.env.ROBOFLOW_API_URL;

    if (!MODEL_ID || !API_KEY || !API_URL) {
      throw new Error("Missing Roboflow environment variables.");
    }

    console.log("🧪 DEBUG ENV:", { MODEL_ID, API_KEY, API_URL });

    // --------------------------------------------
    // ✅ 2. Read uploaded file → buffer
    // --------------------------------------------
    if (!file) throw new Error("No file uploaded.");

    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = imageBuffer.toString("base64");

    // --------------------------------------------
    // ✅ 3. Send to Roboflow
    // --------------------------------------------
    const url = `${API_URL}/${MODEL_ID}?api_key=${API_KEY}`;

    const response = await axios({
      method: "POST",
      url,
      data: base64Image,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      maxBodyLength: Infinity,
    });

    console.log("📡 ROBOFLOW RESPONSE:", response.data);

    // --------------------------------------------
    // ✅ 4. Delete old uploaded file
    // --------------------------------------------
    fs.unlinkSync(file.path);

    // --------------------------------------------
    // ✅ 5. Return prediction
    // --------------------------------------------
    return response.data;
  } catch (error) {
    console.error("❌ ROBOFLOW ERROR:", error.response?.data || error);
    throw new Error("Roboflow processing failed.");
  }
}
