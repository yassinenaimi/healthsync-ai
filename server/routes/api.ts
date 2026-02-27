import { Router, Request, Response } from "express";
import { handleCompare, handleGetAllPlans, handleHealthCheck, handleGetProvinces } from "../controllers/compareController.js";
import { handleAISearch } from "../controllers/aiSearchController.js";
import { handleGetApiKey, handleUpdateApiKey, handleTestApiKey, handleGetTokenUsage, handleResetTokenUsage } from "../controllers/developerController.js";
import { compareValidation, handleValidationErrors } from "../middleware/validation.js";

const router = Router();

// Health check
router.get("/health", handleHealthCheck);

// Get all provinces
router.get("/provinces", handleGetProvinces);

// Get all plans (for browsing)
router.get("/plans", handleGetAllPlans);

// Compare plans (core engine)
router.post("/compare", compareValidation, handleValidationErrors, handleCompare);

// AI-powered insurance search (Gemini with Google Search Grounding)
router.post("/ai-search", handleAISearch);

// Contact form submission
router.post("/contact", (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  // Log contact submissions (integrate with email service in production)
  console.log(`[Contact Form] From: ${name} <${email}> | Subject: ${subject} | Message: ${message}`);
  res.json({ success: true, message: "Thank you for your message. We will get back to you shortly." });
});

// ── Developer API (hidden, no navigation link) ─────────────────────────

// Get current API key (masked)
router.get("/developer/api-key", handleGetApiKey);

// Update API key
router.post("/developer/api-key", handleUpdateApiKey);

// Test if API key is live
router.get("/developer/api-key/test", handleTestApiKey);

// Get token usage statistics
router.get("/developer/token-usage", handleGetTokenUsage);

// Reset token usage counters
router.post("/developer/token-usage/reset", handleResetTokenUsage);

export default router;
