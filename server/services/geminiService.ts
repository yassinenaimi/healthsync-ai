import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { trackTokenUsage } from "../controllers/developerController.js";

dotenv.config();

export interface AIInsuranceResult {
  company_name: string;
  policy_name: string;
  logo_url: string;
  explanation: string;
  url: string;
  coverage_highlights: string[];
  estimated_monthly_cost: string;
  rating: number;
  best_for: string;
}

export interface AISearchResponse {
  results: AIInsuranceResult[];
  analysis_summary: string;
  identified_needs: string[];
}

/* ── Known provider websites (reliable fallback URLs) ── */
const KNOWN_PROVIDER_URLS: Record<string, string> = {
  "blue cross": "https://www.bluecross.ca/en/health-insurance",
  "blue cross blue shield": "https://www.bcbs.com/find-a-plan",
  "unitedhealth": "https://www.uhc.com/individual-and-family/shop-plans",
  "unitedhealthcare": "https://www.uhc.com/individual-and-family/shop-plans",
  "united healthcare": "https://www.uhc.com/individual-and-family/shop-plans",
  "cigna": "https://www.cigna.com/individuals-families/shop-plans",
  "aetna": "https://www.aetna.com/individuals-families/buy-health-insurance.html",
  "humana": "https://www.humana.com/health-insurance",
  "kaiser": "https://healthy.kaiserpermanente.org/shop-plans",
  "kaiser permanente": "https://healthy.kaiserpermanente.org/shop-plans",
  "anthem": "https://www.anthem.com/individual-and-family/health-insurance",
  "sun life": "https://www.sunlife.ca/en/insurance/health-insurance/",
  "manulife": "https://www.manulife.ca/personal/insurance/health-insurance.html",
  "canada life": "https://www.canadalife.com/insurance/health-and-dental-insurance.html",
  "desjardins": "https://www.desjardins.com/ca/personal/insurance/health-insurance/index.jsp",
  "greenshield": "https://www.greenshield.ca/en-ca/individual-plans",
  "green shield": "https://www.greenshield.ca/en-ca/individual-plans",
  "ia financial": "https://ia.ca/individuals/insurance/health-insurance",
  "equitable life": "https://www.equitable.ca/en/individuals/health-and-dental",
  "ssq": "https://ssq.ca/en/individuals/insurance/health-insurance",
  "ssq insurance": "https://ssq.ca/en/individuals/insurance/health-insurance",
  "gms": "https://www.gms.ca/health-insurance",
  "oscar": "https://www.hioscar.com/individuals",
  "oscar health": "https://www.hioscar.com/individuals",
  "ambetter": "https://www.ambetterhealth.com/find-a-plan.html",
  "molina": "https://www.molinahealthcare.com/marketplace",
  "centene": "https://www.centene.com/products-and-services/browse-products/health-insurance-marketplace.html",
  "wellcare": "https://www.wellcare.com/en/Health-Plans",
  "caresource": "https://www.caresource.com/marketplace/",
  "medavie": "https://www.medavie.bluecross.ca/en/health-insurance",
  "medavie blue cross": "https://www.medavie.bluecross.ca/en/health-insurance",
};

/* ── Known provider logo URLs ── */
const KNOWN_LOGO_URLS: Record<string, string> = {
  "blue cross": "https://logo.clearbit.com/bluecross.ca",
  "blue cross blue shield": "https://logo.clearbit.com/bcbs.com",
  "unitedhealth": "https://logo.clearbit.com/uhc.com",
  "unitedhealthcare": "https://logo.clearbit.com/uhc.com",
  "united healthcare": "https://logo.clearbit.com/uhc.com",
  "cigna": "https://logo.clearbit.com/cigna.com",
  "aetna": "https://logo.clearbit.com/aetna.com",
  "humana": "https://logo.clearbit.com/humana.com",
  "kaiser": "https://logo.clearbit.com/kaiserpermanente.org",
  "kaiser permanente": "https://logo.clearbit.com/kaiserpermanente.org",
  "anthem": "https://logo.clearbit.com/anthem.com",
  "sun life": "https://logo.clearbit.com/sunlife.ca",
  "manulife": "https://logo.clearbit.com/manulife.ca",
  "canada life": "https://logo.clearbit.com/canadalife.com",
  "desjardins": "https://logo.clearbit.com/desjardins.com",
  "greenshield": "https://logo.clearbit.com/greenshield.ca",
  "green shield": "https://logo.clearbit.com/greenshield.ca",
  "ia financial": "https://logo.clearbit.com/ia.ca",
  "equitable life": "https://logo.clearbit.com/equitable.ca",
  "ssq": "https://logo.clearbit.com/ssq.ca",
  "ssq insurance": "https://logo.clearbit.com/ssq.ca",
  "gms": "https://logo.clearbit.com/gms.ca",
  "oscar": "https://logo.clearbit.com/hioscar.com",
  "oscar health": "https://logo.clearbit.com/hioscar.com",
  "ambetter": "https://logo.clearbit.com/ambetterhealth.com",
  "molina": "https://logo.clearbit.com/molinahealthcare.com",
  "centene": "https://logo.clearbit.com/centene.com",
  "wellcare": "https://logo.clearbit.com/wellcare.com",
  "caresource": "https://logo.clearbit.com/caresource.com",
  "medavie": "https://logo.clearbit.com/medavie.bluecross.ca",
  "medavie blue cross": "https://logo.clearbit.com/medavie.bluecross.ca",
};

/**
 * getReliableUrl — Returns a known working URL for a provider, or falls back to AI-provided URL
 */
function getReliableUrl(companyName: string, aiUrl?: string): string {
  const key = companyName.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_PROVIDER_URLS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Only use AI URL if it looks valid and doesn't contain common broken patterns
  if (aiUrl && aiUrl.startsWith("http") && !aiUrl.includes("[object") && aiUrl !== "#" && !aiUrl.includes("undefined")) {
    return aiUrl;
  }
  // Last resort: Google search for the provider
  return `https://www.google.com/search?q=${encodeURIComponent(companyName + " health insurance plans")}`;
}

/**
 * getReliableLogoUrl — Returns a known working logo URL for a provider
 */
function getReliableLogoUrl(companyName: string, aiLogoUrl?: string): string {
  const key = companyName.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_LOGO_URLS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  if (aiLogoUrl && aiLogoUrl.startsWith("http") && !aiLogoUrl.includes("[object")) {
    return aiLogoUrl;
  }
  const domain = key.replace(/\s+/g, "").replace(/insurance|health|care|group|inc|corp|ltd/gi, "");
  if (domain.length > 2) {
    return `https://logo.clearbit.com/${domain}.com`;
  }
  return `https://logo.clearbit.com/${key.replace(/\s+/g, "")}.com`;
}

const SYSTEM_PROMPT = `You are a health insurance comparison expert. Your job is to analyze a user's health situation described in plain English and recommend REAL insurance providers and policies that match their needs.

CRITICAL RULES:
1. You MUST ONLY recommend real, existing insurance companies and policies.
2. For URLs, use the company's MAIN health insurance page URL (e.g., https://www.cigna.com/individuals-families or https://www.uhc.com/individual-and-family). Do NOT use deep links to specific plan pages as they often break. Use the company's main shopping/plans page.
3. NEVER invent or hallucinate URLs. If unsure, use the company's homepage URL.
4. Focus on major, well-known insurance providers (e.g., Blue Cross, UnitedHealthcare, Cigna, Aetna, Humana, Kaiser Permanente, Anthem, Sun Life, Manulife, Canada Life, Desjardins, GreenShield, etc.)
5. Analyze the user's story to identify specific medical needs (oncology, dental, vision, chiropractic, mental health, prescription drugs, etc.)
6. Compare which plans are better for the user's specific situation and explain WHY.
7. Return between 4 and 8 insurance recommendations.

For each recommendation, provide:
- company_name: The real name of the insurance company
- policy_name: The actual name or type of the policy/plan
- logo_url: Use format: https://logo.clearbit.com/[company-domain] (e.g., https://logo.clearbit.com/cigna.com)
- explanation: A 2-3 sentence explanation of why this plan fits the user's described needs. Be specific about which needs it addresses.
- url: The company's MAIN health insurance shopping page URL. Use top-level pages like https://www.cigna.com/individuals-families NOT deep links.
- coverage_highlights: An array of 3-5 key coverage features relevant to the user's needs
- estimated_monthly_cost: An estimated monthly cost range (e.g., "$150-$300/month")
- rating: A rating from 1-5 based on how well it matches the user's specific needs (5 = perfect match)
- best_for: A short phrase describing what this plan is best for (e.g., "Families with chronic conditions")

You MUST respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, no extra text):
{
  "analysis_summary": "A brief 2-3 sentence summary of the user's identified health needs and what kind of coverage they should look for.",
  "identified_needs": ["need1", "need2", "need3"],
  "results": [
    {
      "company_name": "...",
      "policy_name": "...",
      "logo_url": "...",
      "explanation": "...",
      "url": "...",
      "coverage_highlights": ["...", "...", "..."],
      "estimated_monthly_cost": "...",
      "rating": 5,
      "best_for": "..."
    }
  ]
}`;

function buildUserPrompt(userStory: string): string {
  return `User's health insurance story:\n\n"${userStory}"\n\nPlease search for real insurance providers and policies that match this person's needs. Use Google Search to find actual insurance company URLs and policy information. Remember: ALL URLs must be real and verified through search. Use top-level company pages, not deep links. Return your response as a JSON object only.`;
}

/**
 * tryModelSearch — Attempts to use a specific Gemini model for the search
 */
async function tryModelSearch(
  modelName: string,
  userStory: string
): Promise<AISearchResponse> {
  console.log(`[Gemini] Trying model: ${modelName}`);

  const currentKey = process.env.GEMINI_API_KEY || "";
  if (!currentKey) {
    throw new Error("Gemini API key is not configured");
  }
  const genAI = new GoogleGenerativeAI(currentKey);

  const model = genAI.getGenerativeModel({
    model: modelName,
    // @ts-ignore - Google Search Grounding tool
    tools: [{ google_search: {} }],
  });

  const userPrompt = buildUserPrompt(userStory);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }],
      },
    ],
  });

  const response = result.response;
  const text = response.text();

  // Track token usage
  const usageMetadata = response.usageMetadata;
  if (usageMetadata) {
    trackTokenUsage({
      model: modelName,
      promptTokens: usageMetadata.promptTokenCount || 0,
      completionTokens: usageMetadata.candidatesTokenCount || 0,
      totalTokens: usageMetadata.totalTokenCount || 0,
      endpoint: "/api/ai-search",
    });
  }

  // Parse the JSON response from Gemini
  let parsed: AISearchResponse;
  try {
    // Try to extract JSON from the response (handle potential markdown wrapping)
    let jsonText = text;

    // Remove markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    // Try to find JSON object in the text
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }

    parsed = JSON.parse(jsonText);
  } catch (parseError) {
    console.error("Failed to parse Gemini response:", text.substring(0, 500));
    throw new Error("Failed to parse AI response. The model returned an invalid format.");
  }

  // Validate and sanitize the response
  if (!parsed.results || !Array.isArray(parsed.results)) {
    throw new Error("AI response missing results array");
  }

  // Ensure all results have required fields AND fix URLs/logos using known maps
  parsed.results = parsed.results.map((r) => ({
    company_name: r.company_name || "Unknown Provider",
    policy_name: r.policy_name || "Health Insurance Plan",
    logo_url: getReliableLogoUrl(r.company_name || "", r.logo_url),
    explanation: r.explanation || "This plan may match your needs.",
    url: getReliableUrl(r.company_name || "", r.url),
    coverage_highlights: Array.isArray(r.coverage_highlights) ? r.coverage_highlights : [],
    estimated_monthly_cost: r.estimated_monthly_cost || "Contact for pricing",
    rating: typeof r.rating === "number" ? Math.min(5, Math.max(1, r.rating)) : 4,
    best_for: r.best_for || "General health coverage",
  }));

  // Sort by rating (best match first)
  parsed.results.sort((a, b) => b.rating - a.rating);

  return {
    analysis_summary: parsed.analysis_summary || "We analyzed your health needs and found matching insurance plans.",
    identified_needs: Array.isArray(parsed.identified_needs) ? parsed.identified_needs : [],
    results: parsed.results,
  };
}

/**
 * searchInsuranceWithAI — Uses Gemini with Google Search Grounding
 * to find real insurance policies matching a user's health story.
 *
 * Tries multiple models in case of quota issues.
 */
export async function searchInsuranceWithAI(userStory: string): Promise<AISearchResponse> {
  const currentKey = process.env.GEMINI_API_KEY || "";
  if (!currentKey) {
    throw new Error("Gemini API key is not configured");
  }

  // Try multiple models in case of quota issues
  const modelNames = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash"];
  let lastError: Error | null = null;

  for (const modelName of modelNames) {
    try {
      return await tryModelSearch(modelName, userStory);
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini] Model ${modelName} failed: ${err.message?.substring(0, 200)}`);

      // Only retry on quota/rate limit errors
      if (!err.message?.includes("429") && !err.message?.includes("quota") && !err.message?.includes("Too Many")) {
        throw err;
      }

      // Wait before trying next model
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  throw lastError || new Error("All AI models failed due to rate limits. Please try again in a moment.");
}
