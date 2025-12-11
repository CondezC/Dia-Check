import express from "express";
import fs from "fs";
import https from "https";
import http from "http";
import path from "path";
import multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { processUpload } from "./lib/processUpload.js";
import { getHistory } from "./lib/getHistory.js";
import { getDiseaseSummary } from "./lib/summary.js";
import { getDiseaseInfo } from "./lib/getDiseaseInfo.js";

dotenv.config();

// 🔍 DEBUG ENV VARIABLES (IMPORTANT)
console.log("🧪 DEBUG ENV:", {
  MODEL_ID: process.env.ROBOFLOW_MODEL_ID,
  API_KEY: process.env.ROBOFLOW_API_KEY,
  API_URL: process.env.ROBOFLOW_API_URL,
});


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const SSL_KEY = path.join(__dirname, "server.key");
const SSL_CERT = path.join(__dirname, "server.cert");
const ENV = process.env.NODE_ENV || "development";

/* -------------------------------------------------------
   HTTPS (LOCAL DEVELOPMENT ONLY)
------------------------------------------------------- */
let server;

if (
  ENV === "development" &&
  fs.existsSync(SSL_KEY) &&
  fs.existsSync(SSL_CERT)
) {
  server = https.createServer(
    {
      key: fs.readFileSync(SSL_KEY),
      cert: fs.readFileSync(SSL_CERT),
    },
    app
  );
  console.log("🔒 HTTPS enabled for development");
} else {
  server = http.createServer(app);
  console.log("🌐 HTTP running (no SSL certs detected)");
}

/* -------------------------------------------------------
   MIDDLEWARES
------------------------------------------------------- */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* -------------------------------------------------------
   FILE UPLOADS (LOCAL ONLY)
------------------------------------------------------- */
const upload = multer({ dest: "uploads/" });
app.use("/uploads", express.static("uploads"));

/* -------------------------------------------------------
   ROUTES
------------------------------------------------------- */

// Redirect root → /home
app.get("/", (req, res) => {
  res.redirect("/home");
});

// Pages
app.get("/home", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/analytics", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "analytics.html"));
});

app.get("/information", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "information.html"));
});

/* -------------------------------------------------------
   API ROUTES
------------------------------------------------------- */

// Upload Endpoint (multer → local file)
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await processUpload({ file: req.file });
    res.json(result);
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Fetch detection history
app.get("/api/history", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getHistory({ page, limit });
    res.json(result);
  } catch (err) {
    console.error("❌ Failed to fetch history:", err.message);
    res.status(500).json({ error: "Failed to fetch classification history." });
  }
});

// Summary dashboard
app.get("/api/summary", async (req, res) => {
  try {
    const result = await getDiseaseSummary();
    res.json(result);
  } catch (err) {
    console.error("❌ Summary error:", err);
    res.status(500).json({ error: "Failed to load summary" });
  }
});

// Information page details
app.get("/api/disease-info", async (req, res) => {
  try {
    const info = await getDiseaseInfo();
    res.json(info);
  } catch (err) {
    console.error("❌ Info error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------------
   CLEAN UP uploads/ FOLDER ON STARTUP
------------------------------------------------------- */
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log("📁 Created uploads/ directory");
} else {
  fs.readdirSync(uploadsPath).forEach((file) => {
    try {
      fs.unlinkSync(path.join(uploadsPath, file));
      console.log(`🗑 Deleted old file: ${file}`);
    } catch (err) {
      console.warn("⚠ Failed to clean uploads:", err.message);
    }
  });
}

/* -------------------------------------------------------
   START SERVER
------------------------------------------------------- */
server.listen(PORT, () => {
  console.log(
    `🚀 Server running at http${server instanceof https.Server ? "s" : ""}://localhost:${PORT}`
  );
});
