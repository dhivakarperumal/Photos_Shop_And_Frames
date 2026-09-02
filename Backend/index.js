const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { AsyncLocalStorage } = require("async_hooks");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.join(__dirname, ".env") });
console.table({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
});

const { initDB } = require("./src/config/db");
const { upload } = require("./src/config/multerConfig");
const usersRouter = require("./src/routers/usersRouter");
const categoryRouter = require("./src/routers/categoryRouter");
const frameRouter = require("./src/routers/frameRouter");
const productRouter = require("./src/routers/productRouter");

const app = express();
const als = new AsyncLocalStorage();

// console.log("Starting backend index.js...");

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ✅ EXACT CORS FIX - Allow multiple ports */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      try {
        const url = new URL(origin);
        const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
        if (isLocalhost) return callback(null, origin);
      } catch (err) { }
      const allowed = ["https://qt1.qtechx.com"];
      if (allowed.includes(origin)) return callback(null, origin);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post("/api/upload", upload.any(), (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (!files.length) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const urls = files.map((file) => {
    const relativePath = path.relative(__dirname, file.path).replace(/\\/g, "/");
    return `/${relativePath}`;
  });

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    url: urls[0],
    urls,
    data: urls,
  });
});



// Health check (must be before the catch-all /api/* 404 handler)
app.get("/api/health", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

app.use("/api/users", usersRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/frames", frameRouter);
app.use("/api/products", productRouter);

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});



async function startServer() {
  try {
    await initDB();

    const PORT = Number(process.env.PORT || 5000);
    const server = app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the running process or set a different PORT.`);
      } else {
        console.error("Server error:", err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error("Backend failed to start:", err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
