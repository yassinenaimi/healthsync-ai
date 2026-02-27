/*
 * useInsuranceEngine — Core hook for insurance plan browsing and comparison
 * Fetches all data from the backend API (database-driven, no hardcoded data)
 * Filtering, sorting, and comparison logic for the browse/discover views
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { getAllPlans, type BrowsePlan } from "@/lib/api";
import type { Province, CoverageCategory } from "@/lib/data";

export interface FilterCriteria {
  province: Province | "";
  planType: "individual" | "couple" | "family" | "";
  maxPremium: number;
  mustHaves: CoverageCategory[];
  minDrugCoverage: number;
  minDentalLimit: number;
  searchQuery: string;
}

export type SortOption = "price-asc" | "price-desc" | "coverage" | "rating" | "provider";

export interface TrueCostEvent {
  id: string;
  month: number;
  description: string;
  amount: number;
  category: "dental" | "drugs" | "vision" | "paramedical";
}

const defaultFilters: FilterCriteria = {
  province: "",
  planType: "",
  maxPremium: 500,
  mustHaves: [],
  minDrugCoverage: 0,
  minDentalLimit: 0,
  searchQuery: "",
};

export function useInsuranceEngine() {
  const [allPlans, setAllPlans] = useState<BrowsePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterCriteria>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [comparedPlanIds, setComparedPlanIds] = useState<number[]>([]);
  const [trueCostEvents, setTrueCostEvents] = useState<TrueCostEvent[]>([]);

  // Fetch plans from backend on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchPlans() {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllPlans();
        if (!cancelled) {
          setAllPlans(response.plans);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load plans");
          // Error already captured in state
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchPlans();
    return () => { cancelled = true; };
  }, []);

  const filteredPlans = useMemo(() => {
    let result = [...allPlans];

    if (filters.province) {
      result = result.filter((p) => p.provinces.includes(filters.province));
    }

    if (filters.planType) {
      result = result.filter((p) => p.plan_type === filters.planType);
    }

    if (filters.maxPremium < 500) {
      result = result.filter((p) => p.monthly_premium <= filters.maxPremium);
    }

    if (filters.minDrugCoverage > 0) {
      result = result.filter((p) => p.drug_coverage.percentage >= filters.minDrugCoverage);
    }

    if (filters.minDentalLimit > 0) {
      result = result.filter((p) => p.dental_coverage.annual_limit >= filters.minDentalLimit);
    }

    if (filters.mustHaves.length > 0) {
      result = result.filter((plan) => {
        return filters.mustHaves.every((need) => {
          switch (need) {
            case "drugs":
              return plan.drug_coverage.percentage >= 70;
            case "dental":
              return plan.dental_coverage.annual_limit >= 1000;
            case "vision":
              return plan.vision_coverage.eyewear_amount >= 150;
            case "massage":
              return plan.paramedical.massage.annual_max >= 400;
            case "chiropractic":
              return plan.paramedical.chiropractic.annual_max >= 300;
            case "physiotherapy":
              return plan.paramedical.physiotherapy.annual_max >= 400;
            default:
              return true;
          }
        });
      });
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.provider.toLowerCase().includes(q) ||
          p.plan_name.toLowerCase().includes(q) ||
          p.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.monthly_premium - b.monthly_premium);
        break;
      case "price-desc":
        result.sort((a, b) => b.monthly_premium - a.monthly_premium);
        break;
      case "coverage":
        result.sort((a, b) => {
          const scoreA = a.drug_coverage.percentage + a.dental_coverage.annual_limit / 100 + a.vision_coverage.eyewear_amount / 50;
          const scoreB = b.drug_coverage.percentage + b.dental_coverage.annual_limit / 100 + b.vision_coverage.eyewear_amount / 50;
          return scoreB - scoreA;
        });
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "provider":
        result.sort((a, b) => a.provider.localeCompare(b.provider));
        break;
    }

    return result;
  }, [allPlans, filters, sortBy]);

  const toggleCompare = useCallback((planId: number) => {
    setComparedPlanIds((prev) => {
      if (prev.includes(planId)) return prev.filter((id) => id !== planId);
      if (prev.length >= 3) return prev;
      return [...prev, planId];
    });
  }, []);

  const comparedPlans = useMemo(() => {
    return comparedPlanIds.map((id) => allPlans.find((p) => p.id === id)!).filter(Boolean);
  }, [comparedPlanIds, allPlans]);

  const calculateTrueCost = useCallback(
    (plan: BrowsePlan, events: TrueCostEvent[]) => {
      const months = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        let premiumCost = plan.monthly_premium;
        let outOfPocket = 0;

        const monthEvents = events.filter((e) => e.month === monthNum);
        for (const event of monthEvents) {
          let coverageRate = 0;
          let cap = Infinity;

          switch (event.category) {
            case "drugs":
              coverageRate = plan.drug_coverage.percentage / 100;
              cap = plan.drug_coverage.annual_cap;
              break;
            case "dental":
              coverageRate = plan.dental_coverage.basic_percentage / 100;
              cap = plan.dental_coverage.annual_limit;
              break;
            case "vision":
              coverageRate = 1;
              cap = plan.vision_coverage.eyewear_amount;
              break;
            case "paramedical":
              coverageRate = 0.8;
              cap = plan.paramedical.massage.annual_max;
              break;
          }

          const covered = Math.min(event.amount * coverageRate, cap);
          outOfPocket += event.amount - covered;
        }

        return {
          month: monthNum,
          monthLabel: new Date(2025, i).toLocaleString("en-CA", { month: "short" }),
          premium: premiumCost,
          outOfPocket: Math.max(0, outOfPocket),
          total: premiumCost + Math.max(0, outOfPocket),
          cumulative: 0,
        };
      });

      let running = plan.deductible;
      for (const m of months) {
        running += m.total;
        m.cumulative = running;
      }

      return months;
    },
    []
  );

  const updateFilters = useCallback((partial: Partial<FilterCriteria>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    filters,
    sortBy,
    filteredPlans,
    comparedPlanIds,
    comparedPlans,
    trueCostEvents,
    loading,
    error,
    updateFilters,
    resetFilters,
    setSortBy,
    toggleCompare,
    setTrueCostEvents,
    calculateTrueCost,
    allPlans,
  };
}
