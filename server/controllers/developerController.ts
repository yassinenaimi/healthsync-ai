import type { Request, Response, NextFunction } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

/**
 * In-memory token usage tracker.
 * In production, you'd persist this to the database.
 */
interface TokenUsageRecord {
  timestamp: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  endpoint: string;
}

// Global token usage store
const tokenUsageLog: TokenUsageRecord[] = [];
let totalPromptTokens = 0;
let totalCompletionTokens = 0;
let totalTokensUsed = 0;
let totalRequests = 0;

/**
 * Track token usage from a Gemini API call
 */
export function trackTokenUsage(record: Omit<TokenUsageRecord, "timestamp">) {
  const entry: TokenUsageRecord = {
    ...record,
    timestamp: new Date().toISOString(),
  };
  tokenUsageLog.push(entry);
  totalPromptTokens += record.promptTokens;
  totalCompletionTokens += record.completionTokens;
  totalTokensUsed += record.totalTokens;
  totalRequests += 1;

  // Keep only last 500 records in memory
  if (tokenUsageLog.length > 500) {
    const removed = tokenUsageLog.shift()!;
    totalPromptTokens -= removed.promptTokens;
    totalCompletionTokens -= removed.completionTokens;
    totalTokensUsed -= removed.totalTokens;
    totalRequests -= 1;
  }
}

/**
 * GET /api/developer/api-key
 * Returns the current Gemini API key (masked)
 */
export function handleGetApiKey(_req: Request, res: Response) {
  const key = process.env.GEMINI_API_KEY || "";
  if (!key) {
    return res.json({
      configured: false,
      maskedKey: "",
      message: "No Gemini API key is configured.",
    });
  }

  // Mask the key: show first 8 and last 4 chars
  const masked =
    key.length > 12
      ? key.substring(0, 8) + "•".repeat(key.length - 12) + key.substring(key.length - 4)
      : "•".repeat(key.length);

  res.json({
    configured: true,
    maskedKey: masked,
    keyLength: key.length,
    message: "Gemini API key is configured.",
  });
}

/**
 * POST /api/developer/api-key
 * Update the Gemini API key at runtime
 */
export function handleUpdateApiKey(req: Request, res: Response) {
  const { apiKey } = req.body;

  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid API key (at least 10 characters).",
    });
  }

  const trimmedKey = apiKey.trim();

  // Update the environment variable at runtime
  process.env.GEMINI_API_KEY = trimmedKey;

  // Mask for response
  const masked =
    trimmedKey.length > 12
      ? trimmedKey.substring(0, 8) + "•".repeat(trimmedKey.length - 12) + trimmedKey.substring(trimmedKey.length - 4)
      : "•".repeat(trimmedKey.length);

  console.log(`[Developer] Gemini API key updated (masked: ${masked})`);

  res.json({
    success: true,
    maskedKey: masked,
    message: "Gemini API key updated successfully. The new key is active immediately.",
  });
}

/**
 * GET /api/developer/api-key/test
 * Test if the current Gemini API key is live and working
 */
export async function handleTestApiKey(_req: Request, res: Response) {
  const key = process.env.GEMINI_API_KEY || "";

  if (!key) {
    return res.json({
      live: false,
      error: "No Gemini API key is configured.",
      models: [],
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Simple test: generate a very short response
    const result = await model.generateContent("Say 'API key is working' in exactly those words.");
    const response = result.response;
    const text = response.text();

    // Try to get usage metadata
    const usageMetadata = response.usageMetadata;
    let tokenInfo = null;
    if (usageMetadata) {
      tokenInfo = {
        promptTokens: usageMetadata.promptTokenCount || 0,
        completionTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0,
      };

      // Track this test call
      trackTokenUsage({
        model: "gemini-2.0-flash",
        promptTokens: tokenInfo.promptTokens,
        completionTokens: tokenInfo.completionTokens,
        totalTokens: tokenInfo.totalTokens,
        endpoint: "/api/developer/api-key/test",
      });
    }

    res.json({
      live: true,
      message: "Gemini API key is live and working!",
      testResponse: text.substring(0, 100),
      tokenInfo,
      testedModel: "gemini-2.0-flash",
      testedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Developer] API key test failed:", error.message);

    let errorMessage = "API key test failed.";
    let errorCode = "UNKNOWN_ERROR";

    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("401")) {
      errorMessage = "The API key is invalid or has been revoked.";
      errorCode = "INVALID_KEY";
    } else if (error.message?.includes("429") || error.message?.includes("quota")) {
      errorMessage = "API key is valid but rate limited. Try again in a moment.";
      errorCode = "RATE_LIMITED";
    } else if (error.message?.includes("403")) {
      errorMessage = "API key doesn't have permission to access Gemini models.";
      errorCode = "PERMISSION_DENIED";
    }

    res.json({
      live: false,
      error: errorMessage,
      errorCode,
      details: error.message?.substring(0, 200),
      testedAt: new Date().toISOString(),
    });
  }
}

/**
 * GET /api/developer/token-usage
 * Returns token usage statistics
 */
export function handleGetTokenUsage(_req: Request, res: Response) {
  // Calculate per-model breakdown
  const modelBreakdown: Record<string, { requests: number; promptTokens: number; completionTokens: number; totalTokens: number }> = {};

  for (const record of tokenUsageLog) {
    if (!modelBreakdown[record.model]) {
      modelBreakdown[record.model] = { requests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    }
    modelBreakdown[record.model].requests += 1;
    modelBreakdown[record.model].promptTokens += record.promptTokens;
    modelBreakdown[record.model].completionTokens += record.completionTokens;
    modelBreakdown[record.model].totalTokens += record.totalTokens;
  }

  // Recent requests (last 20)
  const recentRequests = tokenUsageLog.slice(-20).reverse();

  res.json({
    summary: {
      totalRequests,
      totalPromptTokens,
      totalCompletionTokens,
      totalTokensUsed,
      trackingSince: tokenUsageLog.length > 0 ? tokenUsageLog[0].timestamp : null,
    },
    modelBreakdown,
    recentRequests,
  });
}

/**
 * POST /api/developer/token-usage/reset
 * Reset token usage counters
 */
export function handleResetTokenUsage(_req: Request, res: Response) {
  tokenUsageLog.length = 0;
  totalPromptTokens = 0;
  totalCompletionTokens = 0;
  totalTokensUsed = 0;
  totalRequests = 0;

  res.json({
    success: true,
    message: "Token usage counters have been reset.",
  });
}
