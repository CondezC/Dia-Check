import { IncomingForm } from "formidable";
import { processUpload } from "../lib/processUpload.js";

export const config = {
  api: { bodyParser: { sizeLimit: "15mb" } },
};

export default async function handler(req, res) {
  // -----------------------------------------
  // 🚀 1) BASE64 MODE (JSON) — SKIP FORMIDABLE
  // -----------------------------------------
  if (req.headers["content-type"]?.includes("application/json")) {
    try {
      const base64 = req.body.image;

      if (!base64) {
        return res.status(400).json({ error: "Missing base64 image." });
      }

      const result = await processUpload({ file: null, base64 });
      return res.status(200).json(result);

    } catch (err) {
      console.error("❌ Base64 upload error:", err.message);
      return res.status(500).json({ error: "Upload failed", detail: err.message });
    }
  }

  // -----------------------------------------
  // 🚀 2) FILE UPLOAD MODE (FORM-DATA)
  // -----------------------------------------
  const form = new IncomingForm({
    multiples: false,
    keepExtensions: true,
    uploadDir: "./uploads", // localhost only
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error("❌ Formidable parse error:", err.message);
        return res.status(400).json({ error: "Form parsing failed" });
      }

      const file = Array.isArray(files.image) ? files.image[0] : files.image;

      if (!file) {
        return res
          .status(400)
          .json({ error: "Missing image file (form-data)." });
      }

      const result = await processUpload({ file, base64: null });
      return res.status(200).json(result);

    } catch (err) {
      console.error("❌ Upload handler error:", err.message);
      return res.status(500).json({ error: "Upload failed", detail: err.message });
    }
  });
}
