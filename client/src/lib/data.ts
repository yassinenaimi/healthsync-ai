/*
 * HealthSync — Type Definitions & Constants
 * All plan data is now fetched from the backend database.
 * This file contains only type definitions and static constants.
 */

import type { BrowsePlan, PlanResult } from "./api";

// Re-export API types for backward compatibility
export type InsurancePlan = BrowsePlan;
export type ComparedPlan = PlanResult;

export const provinces = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"
] as const;

export type Province = typeof provinces[number];

export const provinceNames: Record<string, string> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

export const coverageCategories = [
  { key: "drugs", label: "Prescription Drugs", icon: "Pill" },
  { key: "dental", label: "Dental Care", icon: "Smile" },
  { key: "vision", label: "Vision Care", icon: "Eye" },
  { key: "massage", label: "Massage Therapy", icon: "Hand" },
  { key: "chiropractic", label: "Chiropractic", icon: "Bone" },
  { key: "physiotherapy", label: "Physiotherapy", icon: "Activity" },
] as const;

export type CoverageCategory = typeof coverageCategories[number]["key"];
