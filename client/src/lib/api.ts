/*
 * API Client — Connects frontend to the HealthSync backend comparison engine
 * All insurance data is fetched from the database via REST API
 * AI-powered search uses Gemini with Google Search Grounding
 */

import axios from "axios";

// API base URL: configurable via environment variable for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // 60s timeout for AI requests
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Types ───────────────────────────────────────────────────────────────

export interface CompareRequest {
  age: number;
  gender?: string;
  province: string;
  smoking_status: "smoker" | "non-smoker";
  budget_min?: number;
  budget_max?: number;
  coverage_type?: string;
  plan_type?: string;
  addons?: string[];
}

export interface PlanResult {
  plan_id: number;
  plan_name: string;
  provider: string;
  provider_logo_color: string;
  provider_logo_url: string | null;
  provider_website: string | null;
  enrollment_url: string | null;
  monthly_price: number;
  annual_price: number;
  base_price: number;
  age_modifier: number;
  smoker_modifier: number;
  addon_total: number;
  coverage_type: string;
  coverage_limit: string;
  plan_type: string;
  deductible: number;
  drug_coverage: {
    percentage: number;
    annual_cap: number;
    deductible: number;
  };
  dental_coverage: {
    basic_percentage: number;
    major_percentage: number;
    annual_limit: number;
    orthodontic_limit: number;
  };
  vision_coverage: {
    exam_amount: number;
    eyewear_amount: number;
    frequency: string;
  };
  paramedical: {
    massage: { per_visit: number; annual_max: number; visit_limit: number };
    chiropractic: { per_visit: number; annual_max: number; visit_limit: number };
    physiotherapy: { per_visit: number; annual_max: number; visit_limit: number };
  };
  highlights: string[];
  included_addons: { name: string; price: number }[];
  rating: number;
}

export interface CompareResponse {
  count: number;
  filters_applied: {
    age: number;
    province: string;
    smoking_status: string;
    coverage_type: string;
    plan_type: string;
    budget_range: { min: number | null; max: number | null };
    requested_addons: string[];
  };
  results: PlanResult[];
}

export interface BrowsePlan {
  id: number;
  provider: string;
  provider_logo_color: string;
  provider_logo_url: string | null;
  provider_website: string | null;
  enrollment_url: string | null;
  plan_name: string;
  monthly_premium: number;
  annual_premium: number;
  coverage_type: string;
  plan_type: string;
  family_option: boolean;
  deductible: number;
  coverage_limit: number;
  drug_coverage: {
    percentage: number;
    annual_cap: number;
    deductible: number;
  };
  dental_coverage: {
    basic_percentage: number;
    major_percentage: number;
    annual_limit: number;
    orthodontic_limit: number;
  };
  vision_coverage: {
    exam_amount: number;
    eyewear_amount: number;
    frequency: string;
  };
  paramedical: {
    massage: { per_visit: number; annual_max: number; visit_limit: number };
    chiropractic: { per_visit: number; annual_max: number; visit_limit: number };
    physiotherapy: { per_visit: number; annual_max: number; visit_limit: number };
  };
  provinces: string[];
  highlights: string[];
  available_addons: { name: string; price: number; description: string }[];
  rating: number;
}

export interface PlansResponse {
  count: number;
  plans: BrowsePlan[];
}

export interface Province {
  code: string;
  name: string;
}

// ── AI Search Types ────────────────────────────────────────────────────

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
  success: boolean;
  results: AIInsuranceResult[];
  analysis_summary: string;
  identified_needs: string[];
}

// ── API Functions ───────────────────────────────────────────────────────

/**
 * POST /api/compare — Core comparison engine
 * Sends user criteria, returns filtered & priced plans sorted by price
 */
export async function comparePlans(request: CompareRequest): Promise<CompareResponse> {
  const response = await api.post<CompareResponse>("/compare", request);
  return response.data;
}

/**
 * GET /api/plans — Fetch all plans for browsing
 */
export async function getAllPlans(): Promise<PlansResponse> {
  const response = await api.get<PlansResponse>("/plans");
  return response.data;
}

/**
 * GET /api/provinces — Fetch list of supported provinces
 */
export async function getProvinces(): Promise<Province[]> {
  const response = await api.get<{ provinces: Province[] }>("/provinces");
  return response.data.provinces;
}

/**
 * GET /api/health — Health check
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await api.get<{ status: string }>("/health");
  return response.data;
}

/**
 * POST /api/ai-search — AI-powered insurance search
 * Sends user's health story, returns real insurance recommendations
 * powered by Gemini with Google Search Grounding
 */
export async function aiSearchInsurance(story: string): Promise<AISearchResponse> {
  const response = await api.post<AISearchResponse>("/ai-search", { story });
  return response.data;
}
