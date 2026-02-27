import { Op } from "sequelize";
import { InsurancePlan, PlanProvince, PlanAddon, PricingModifier, Provider } from "../models/index.js";

/**
 * CompareRequest — the validated input from POST /compare
 */
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

/**
 * CompareResult — a single plan result returned to the client
 */
export interface CompareResult {
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

/**
 * comparePlans — the core deterministic comparison engine
 *
 * Steps:
 * 1. Query plans available in user's province
 * 2. Filter by age eligibility
 * 3. Filter by smoking status
 * 4. Filter by coverage type (if specified)
 * 5. Filter by plan type (if specified)
 * 6. Calculate final price using pricing modifiers from DB
 * 7. Apply selected add-ons
 * 8. Filter by budget range AFTER price calculation
 * 9. Sort by monthly_price ASC
 * 10. Return structured results
 */
export async function comparePlans(request: CompareRequest): Promise<CompareResult[]> {
  const { age, province, smoking_status, budget_min, budget_max, coverage_type, plan_type, addons } = request;

  // Step 1: Get plan IDs available in user's province
  const provinceRecords = await PlanProvince.findAll({
    where: { province_code: province.toUpperCase() },
    attributes: ["plan_id"],
  });
  const availablePlanIds = provinceRecords.map((r) => r.plan_id);

  if (availablePlanIds.length === 0) {
    return [];
  }

  // Step 2-4: Build WHERE clause for age, smoking, coverage type
  const whereClause: any = {
    id: { [Op.in]: availablePlanIds },
    min_age: { [Op.lte]: age },
    max_age: { [Op.gte]: age },
  };

  // Step 3: Smoking filter — if user is a smoker, only show plans that allow smokers
  if (smoking_status === "smoker") {
    whereClause.smoker_allowed = true;
  }

  // Step 4: Coverage type filter
  if (coverage_type) {
    whereClause.coverage_type = coverage_type.toLowerCase();
  }

  // Step 5: Plan type filter
  if (plan_type) {
    whereClause.plan_type = plan_type.toLowerCase();
  }

  // Query plans with associations
  const plans = await InsurancePlan.findAll({
    where: whereClause,
    include: [
      {
        model: Provider,
        as: "provider",
        attributes: ["name", "logo_color", "logo_url", "enrollment_base_url", "website"],
      },
      {
        model: PlanAddon,
        as: "addons",
      },
      {
        model: PricingModifier,
        as: "pricing_modifiers",
      },
      {
        model: PlanProvince,
        as: "provinces",
        attributes: ["province_code"],
      },
    ],
  });

  // Step 6-7: Calculate final price for each plan
  const results: CompareResult[] = [];

  for (const plan of plans) {
    const providerData = (plan as any).provider;
    const planAddons = (plan as any).addons as PlanAddon[];
    const modifiers = (plan as any).pricing_modifiers as PricingModifier[];

    const basePrice = Number(plan.base_price);

    // Calculate age modifier from pricing_modifiers table
    let ageModifier = 0;
    for (const mod of modifiers) {
      if (mod.condition_key === "age") {
        const minAge = mod.age_min ?? 0;
        const maxAge = mod.age_max ?? 999;
        if (age >= minAge && age <= maxAge) {
          if (mod.modifier_type === "flat") {
            ageModifier += Number(mod.modifier_value);
          } else if (mod.modifier_type === "percentage") {
            ageModifier += basePrice * (Number(mod.modifier_value) / 100);
          }
        }
      }
    }

    // Calculate smoker modifier from pricing_modifiers table
    let smokerModifier = 0;
    if (smoking_status === "smoker") {
      for (const mod of modifiers) {
        if (mod.condition_key === "smoker" && mod.condition_value === "yes") {
          if (mod.modifier_type === "flat") {
            smokerModifier += Number(mod.modifier_value);
          } else if (mod.modifier_type === "percentage") {
            smokerModifier += basePrice * (Number(mod.modifier_value) / 100);
          }
        }
      }
    }

    // Calculate add-on costs
    let addonTotal = 0;
    const includedAddons: { name: string; price: number }[] = [];

    if (addons && addons.length > 0) {
      for (const requestedAddon of addons) {
        const matchingAddon = planAddons.find(
          (a) => a.addon_name.toLowerCase() === requestedAddon.toLowerCase()
        );
        if (matchingAddon) {
          const addonPrice = Number(matchingAddon.addon_price);
          addonTotal += addonPrice;
          includedAddons.push({
            name: matchingAddon.addon_name,
            price: addonPrice,
          });
        }
      }
    }

    // Final price = base_price + age_modifier + smoker_modifier + sum(selected_addons)
    const monthlyPrice = Math.round((basePrice + ageModifier + smokerModifier + addonTotal) * 100) / 100;

    // Step 8: Budget filter (AFTER price calculation)
    if (budget_max !== undefined && monthlyPrice > budget_max) {
      continue;
    }
    if (budget_min !== undefined && monthlyPrice < budget_min) {
      continue;
    }

    results.push({
      plan_id: plan.id,
      plan_name: plan.plan_name,
      provider: providerData?.name || "Unknown",
      provider_logo_color: providerData?.logo_color || "#1E40AF",
      provider_logo_url: providerData?.logo_url || null,
      provider_website: providerData?.website || null,
      enrollment_url: providerData?.enrollment_base_url || null,
      monthly_price: monthlyPrice,
      annual_price: Math.round(monthlyPrice * 12 * 100) / 100,
      base_price: basePrice,
      age_modifier: Math.round(ageModifier * 100) / 100,
      smoker_modifier: Math.round(smokerModifier * 100) / 100,
      addon_total: Math.round(addonTotal * 100) / 100,
      coverage_type: plan.coverage_type,
      coverage_limit: `$${Number(plan.coverage_limit).toLocaleString()}`,
      plan_type: plan.plan_type,
      deductible: Number(plan.deductible),
      drug_coverage: {
        percentage: plan.drug_coverage_pct,
        annual_cap: Number(plan.drug_annual_cap),
        deductible: Number(plan.drug_deductible),
      },
      dental_coverage: {
        basic_percentage: plan.dental_basic_pct,
        major_percentage: plan.dental_major_pct,
        annual_limit: Number(plan.dental_annual_limit),
        orthodontic_limit: Number(plan.dental_orthodontic_limit),
      },
      vision_coverage: {
        exam_amount: Number(plan.vision_exam_amount),
        eyewear_amount: Number(plan.vision_eyewear_amount),
        frequency: plan.vision_frequency,
      },
      paramedical: {
        massage: {
          per_visit: Number(plan.massage_per_visit),
          annual_max: Number(plan.massage_annual_max),
          visit_limit: plan.massage_visit_limit,
        },
        chiropractic: {
          per_visit: Number(plan.chiro_per_visit),
          annual_max: Number(plan.chiro_annual_max),
          visit_limit: plan.chiro_visit_limit,
        },
        physiotherapy: {
          per_visit: Number(plan.physio_per_visit),
          annual_max: Number(plan.physio_annual_max),
          visit_limit: plan.physio_visit_limit,
        },
      },
      highlights: plan.highlights || [],
      included_addons: includedAddons,
      rating: Number(plan.rating),
    });
  }

  // Step 9: Sort by monthly_price ASC (deterministic)
  results.sort((a, b) => a.monthly_price - b.monthly_price);

  return results;
}

/**
 * getAllPlans — returns all plans with full details (for frontend browsing)
 */
export async function getAllPlans(): Promise<any[]> {
  const plans = await InsurancePlan.findAll({
    include: [
      {
        model: Provider,
        as: "provider",
        attributes: ["name", "logo_color", "logo_url", "enrollment_base_url", "website"],
      },
      {
        model: PlanAddon,
        as: "addons",
      },
      {
        model: PlanProvince,
        as: "provinces",
        attributes: ["province_code"],
      },
    ],
    order: [["rating", "DESC"]],
  });

  return plans.map((plan) => {
    const providerData = (plan as any).provider;
    const planAddons = (plan as any).addons as PlanAddon[];
    const provinces = ((plan as any).provinces as PlanProvince[]).map((p) => p.province_code);

    return {
      id: plan.id,
      provider: providerData?.name || "Unknown",
      provider_logo_color: providerData?.logo_color || "#1E40AF",
      provider_logo_url: providerData?.logo_url || null,
      provider_website: providerData?.website || null,
      enrollment_url: providerData?.enrollment_base_url || null,
      plan_name: plan.plan_name,
      monthly_premium: Number(plan.base_price),
      annual_premium: Number(plan.base_price) * 12,
      coverage_type: plan.coverage_type,
      plan_type: plan.plan_type,
      family_option: plan.family_option,
      deductible: Number(plan.deductible),
      coverage_limit: Number(plan.coverage_limit),
      drug_coverage: {
        percentage: plan.drug_coverage_pct,
        annual_cap: Number(plan.drug_annual_cap),
        deductible: Number(plan.drug_deductible),
      },
      dental_coverage: {
        basic_percentage: plan.dental_basic_pct,
        major_percentage: plan.dental_major_pct,
        annual_limit: Number(plan.dental_annual_limit),
        orthodontic_limit: Number(plan.dental_orthodontic_limit),
      },
      vision_coverage: {
        exam_amount: Number(plan.vision_exam_amount),
        eyewear_amount: Number(plan.vision_eyewear_amount),
        frequency: plan.vision_frequency,
      },
      paramedical: {
        massage: {
          per_visit: Number(plan.massage_per_visit),
          annual_max: Number(plan.massage_annual_max),
          visit_limit: plan.massage_visit_limit,
        },
        chiropractic: {
          per_visit: Number(plan.chiro_per_visit),
          annual_max: Number(plan.chiro_annual_max),
          visit_limit: plan.chiro_visit_limit,
        },
        physiotherapy: {
          per_visit: Number(plan.physio_per_visit),
          annual_max: Number(plan.physio_annual_max),
          visit_limit: plan.physio_visit_limit,
        },
      },
      provinces,
      highlights: plan.highlights || [],
      available_addons: planAddons.map((a) => ({
        name: a.addon_name,
        price: Number(a.addon_price),
        description: a.description,
      })),
      rating: Number(plan.rating),
    };
  });
}
