import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { sequelize } from "./models/index.js";
import apiRoutes from "./routes/api.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Security ──────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── CORS ──────────────────────────────────────────────────────────────
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000", "http://localhost:5173"];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
          return callback(null, true);
        }
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      },
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // ── Rate Limiting ─────────────────────────────────────────────────────
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });

  // ── Body Parsing ──────────────────────────────────────────────────────
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: false }));

  // ── API Routes ────────────────────────────────────────────────────────
  app.use("/api", apiLimiter, apiRoutes);

  // ── Static Files (production) ─────────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return notFoundHandler(req, res);
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // ── Error Handling ────────────────────────────────────────────────────
  app.use(errorHandler);

  // ── Database Connection ───────────────────────────────────────────────
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully.");
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("Database models synced.");
    }
  } catch (dbError) {
    console.error("Database connection failed:", dbError);
    console.warn("Server will start without database. API endpoints will return errors.");
  }

  // ── Start Server ──────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`HealthSync Comparison Engine running on http://localhost:${port}/`);
    console.log(`API available at http://localhost:${port}/api/health`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer().catch(console.error);
