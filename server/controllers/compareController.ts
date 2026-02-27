import type { Request, Response, NextFunction } from "express";
import { comparePlans, getAllPlans, type CompareRequest } from "../services/comparisonService.js";

/**
 * POST /api/compare
 * Accepts user criteria and returns filtered, priced, sorted insurance plans
 */
export async function handleCompare(req: Request, res: Response, next: NextFunction) {
  try {
    const request: CompareRequest = {
      age: req.body.age,
      gender: req.body.gender,
      province: req.body.province.toUpperCase(),
      smoking_status: req.body.smoking_status,
      budget_min: req.body.budget_min,
      budget_max: req.body.budget_max,
      coverage_type: req.body.coverage_type,
      plan_type: req.body.plan_type,
      addons: req.body.addons,
    };

    const results = await comparePlans(request);

    res.json({
      count: results.length,
      filters_applied: {
        age: request.age,
        province: request.province,
        smoking_status: request.smoking_status,
        coverage_type: request.coverage_type || "all",
        plan_type: request.plan_type || "all",
        budget_range: {
          min: request.budget_min || null,
          max: request.budget_max || null,
        },
        requested_addons: request.addons || [],
      },
      results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/plans
 * Returns all plans with full details for frontend browsing/filtering
 * Gracefully returns empty array if database is unavailable
 */
export async function handleGetAllPlans(_req: Request, res: Response, _next: NextFunction) {
  try {
    const plans = await getAllPlans();
    res.json({
      count: plans.length,
      plans,
    });
  } catch (error: any) {
    // Database not connected — return empty plans gracefully instead of 500
    console.warn("[Plans] Database unavailable, returning empty plans:", error.message);
    res.json({
      count: 0,
      plans: [],
      notice: "Plan database is currently unavailable. Use AI Search to discover insurance plans.",
    });
  }
}

/**
 * GET /api/health
 * Health check endpoint
 */
export function handleHealthCheck(_req: Request, res: Response) {
  res.json({
    status: "ok",
    service: "HealthSync Insurance Comparison Engine",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /api/provinces
 * Returns list of supported provinces
 */
export function handleGetProvinces(_req: Request, res: Response) {
  const provinces = [
    { code: "AB", name: "Alberta" },
    { code: "BC", name: "British Columbia" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "New Brunswick" },
    { code: "NL", name: "Newfoundland and Labrador" },
    { code: "NS", name: "Nova Scotia" },
    { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" },
    { code: "ON", name: "Ontario" },
    { code: "PE", name: "Prince Edward Island" },
    { code: "QC", name: "Quebec" },
    { code: "SK", name: "Saskatchewan" },
    { code: "YT", name: "Yukon" },
  ];
  res.json({ provinces });
}
