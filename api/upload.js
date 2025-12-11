import { processUpload } from "../lib/processUpload.js";

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const base64 = req.body.image;
    if (!base64) {
      return res.status(400).json({ error: "Missing base64 image" });
    }

    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");

    const result = await processUpload({ base64: cleanBase64 });

    return res.status(200).json(result);

  } catch (err) {
    console.error("❌ Upload API Error:", err.message);
    return res.status(500).json({ error: "Upload failed", detail: err.message });
  }
}
