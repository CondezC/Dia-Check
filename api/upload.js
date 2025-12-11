import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image received." });
    }

    // --------------------------------------------
    // 1️⃣ Load env vars (Vercel env variables)
    // --------------------------------------------
    const MODEL_ID = process.env.MODEL_ID || process.env.ROBOFLOW_MODEL_ID;
    const API_KEY = process.env.API_KEY || process.env.ROBOFLOW_API_KEY;
    const API_URL = process.env.API_URL || process.env.ROBOFLOW_API_URL;

    if (!MODEL_ID || !API_KEY || !API_URL) {
      return res.status(500).json({
        error: "Missing Roboflow environment variables."
      });
    }

    // --------------------------------------------
    // 2️⃣ Strip "data:image/...;base64," prefix
    // --------------------------------------------
    const base64 = image.replace(/^data:image\/\w+;base64,/, "");

    // --------------------------------------------
    // 3️⃣ Prepare Roboflow request
    // --------------------------------------------
    const url = `${API_URL}/${MODEL_ID}?api_key=${API_KEY}`;

    const rfResponse = await axios({
      method: "POST",
      url,
      data: base64,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      maxBodyLength: Infinity,
    });

    console.log("📡 Roboflow Response:", rfResponse.data);

    // --------------------------------------------
    // 4️⃣ Return prediction to frontend
    // --------------------------------------------
    return res.status(200).json(rfResponse.data);

  } catch (error) {
    console.error("❌ Upload API Error:", error.response?.data || error);
    return res.status(500).json({
      error: "Roboflow processing failed."
    });
  }
}
