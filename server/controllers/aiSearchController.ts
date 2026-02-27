import type { Request, Response, NextFunction } from "express";
import { searchInsuranceWithAI } from "../services/geminiService.js";

/**
 * POST /api/ai-search
 * Accepts a user's health story and returns AI-powered insurance recommendations
 * using Gemini with Google Search Grounding for real, verified results.
 */
export async function handleAISearch(req: Request, res: Response, next: NextFunction) {
  try {
    const { story } = req.body;

    if (!story || typeof story !== "string" || story.trim().length < 10) {
      return res.status(400).json({
        error: "Please provide a health story with at least 10 characters.",
        code: "INVALID_STORY",
      });
    }

    if (story.length > 2000) {
      return res.status(400).json({
        error: "Story is too long. Please keep it under 2000 characters.",
        code: "STORY_TOO_LONG",
      });
    }

    console.log(`[AI Search] Processing story: "${story.substring(0, 100)}..."`);

    const results = await searchInsuranceWithAI(story.trim());

    console.log(`[AI Search] Found ${results.results.length} recommendations`);

    res.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    console.error("[AI Search] Error:", error.message);

    if (error.message?.includes("API key")) {
      return res.status(503).json({
        error: "AI service is not properly configured.",
        code: "AI_CONFIG_ERROR",
      });
    }

    if (error.message?.includes("parse")) {
      return res.status(502).json({
        error: "AI returned an unexpected response. Please try again.",
        code: "AI_PARSE_ERROR",
      });
    }

    res.status(500).json({
      error: "AI search failed. Please try again later.",
      code: "AI_SEARCH_ERROR",
      details: error.message,
    });
  }
}
