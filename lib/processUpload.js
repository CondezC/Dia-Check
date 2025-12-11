import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function processUpload({ base64 }) {
  try {
    const MODEL_ID = process.env.MODEL_ID;
    const API_KEY = process.env.API_KEY;
    const API_URL = process.env.API_URL;

    if (!MODEL_ID || !API_KEY || !API_URL) {
      throw new Error("Missing Roboflow environment variables.");
    }

    const url = `${API_URL}/${MODEL_ID}?api_key=${API_KEY}`;

    const response = await axios({
      method: "POST",
      url,
      data: base64,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      maxBodyLength: Infinity,
    });

    return response.data;

  } catch (error) {
    console.error("❌ RoboFlow Error:", error.response?.data || error);
    throw new Error("Roboflow processing failed.");
  }
}
