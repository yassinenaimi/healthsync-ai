import { sequelize, Provider, InsurancePlan, PlanProvince, PlanAddon, PricingModifier } from "../models/index.js";

const PROVINCE_NAMES: Record<string, string> = {
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

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    // ── Providers (with real logos and enrollment URLs) ────────────────────
    const providers = await Provider.bulkCreate([
      {
        name: "Blue Cross",
        website: "https://www.bluecross.ca",
        contact_email: "info@bluecross.ca",
        logo_color: "#1E40AF",
        logo_url: "https://logo.clearbit.com/bluecross.ca",
        enrollment_base_url: "https://www.bluecross.ca/en/health-insurance",
      },
      {
        name: "Manulife",
        website: "https://www.manulife.ca",
        contact_email: "info@manulife.ca",
        logo_color: "#047857",
        logo_url: "https://logo.clearbit.com/manulife.ca",
        enrollment_base_url: "https://www.manulife.ca/personal/insurance/health-insurance.html",
      },
      {
        name: "Canada Life",
        website: "https://www.canadalife.com",
        contact_email: "info@canadalife.com",
        logo_color: "#7C3AED",
        logo_url: "https://logo.clearbit.com/canadalife.com",
        enrollment_base_url: "https://www.canadalife.com/insurance/health-and-dental-insurance.html",
      },
      {
        name: "Sun Life",
        website: "https://www.sunlife.ca",
        contact_email: "info@sunlife.ca",
        logo_color: "#DC2626",
        logo_url: "https://logo.clearbit.com/sunlife.ca",
        enrollment_base_url: "https://www.sunlife.ca/en/insurance/health-insurance/",
      },
      {
        name: "GMS",
        website: "https://www.gms.ca",
        contact_email: "info@gms.ca",
        logo_color: "#0891B2",
        logo_url: "https://logo.clearbit.com/gms.ca",
        enrollment_base_url: "https://www.gms.ca/health-insurance",
      },
      {
        name: "Desjardins",
        website: "https://www.desjardins.com",
        contact_email: "info@desjardins.com",
        logo_color: "#059669",
        logo_url: "https://logo.clearbit.com/desjardins.com",
        enrollment_base_url: "https://www.desjardins.com/ca/personal/insurance/health-insurance/index.jsp",
      },
      {
        name: "iA Financial",
        website: "https://ia.ca",
        contact_email: "info@ia.ca",
        logo_color: "#1D4ED8",
        logo_url: "https://logo.clearbit.com/ia.ca",
        enrollment_base_url: "https://ia.ca/individuals/insurance/health-insurance",
      },
      {
        name: "GreenShield",
        website: "https://www.greenshield.ca",
        contact_email: "info@greenshield.ca",
        logo_color: "#16A34A",
        logo_url: "https://logo.clearbit.com/greenshield.ca",
        enrollment_base_url: "https://www.greenshield.ca/en-ca/individual-plans",
      },
      {
        name: "Equitable Life",
        website: "https://www.equitable.ca",
        contact_email: "info@equitable.ca",
        logo_color: "#B45309",
        logo_url: "https://logo.clearbit.com/equitable.ca",
        enrollment_base_url: "https://www.equitable.ca/en/individuals/health-and-dental",
      },
      {
        name: "SSQ Insurance",
        website: "https://ssq.ca",
        contact_email: "info@ssq.ca",
        logo_color: "#9333EA",
        logo_url: "https://logo.clearbit.com/ssq.ca",
        enrollment_base_url: "https://ssq.ca/en/individuals/insurance/health-insurance",
      },
    ]);

    const providerMap: Record<string, number> = {};
    providers.forEach((p) => { providerMap[p.name] = p.id; });

    // ── Insurance Plans ───────────────────────────────────────────────────
    const planData = [
      {
        provider: "Blue Cross", plan_name: "Essential Care", base_price: 89, plan_type: "individual",
        family_option: false, deductible: 100, coverage_limit: 100000, smoker_allowed: true,
        drug_coverage_pct: 80, drug_annual_cap: 5000, drug_deductible: 50,
        dental_basic_pct: 80, dental_major_pct: 50, dental_annual_limit: 1500, dental_orthodontic_limit: 0,
        vision_exam_amount: 75, vision_eyewear_amount: 200, vision_frequency: "every 24 months",
        massage_per_visit: 50, massage_annual_max: 500, massage_visit_limit: 10,
        chiro_per_visit: 40, chiro_annual_max: 400, chiro_visit_limit: 10,
        physio_per_visit: 50, physio_annual_max: 500, physio_visit_limit: 10,
        rating: 3.5, highlights: ["No medical questionnaire", "Direct drug card"],
        provinces: ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK"],
      },
      {
        provider: "Blue Cross", plan_name: "Enhanced Family Shield", base_price: 245, plan_type: "family",
        family_option: true, deductible: 0, coverage_limit: 250000, smoker_allowed: true,
        drug_coverage_pct: 90, drug_annual_cap: 10000, drug_deductible: 25,
        dental_basic_pct: 90, dental_major_pct: 70, dental_annual_limit: 3000, dental_orthodontic_limit: 2000,
        vision_exam_amount: 100, vision_eyewear_amount: 400, vision_frequency: "every 24 months",
        massage_per_visit: 75, massage_annual_max: 1000, massage_visit_limit: 20,
        chiro_per_visit: 60, chiro_annual_max: 800, chiro_visit_limit: 15,
        physio_per_visit: 75, physio_annual_max: 1000, physio_visit_limit: 20,
        rating: 4.5, highlights: ["Zero deductible", "Orthodontic coverage", "Travel emergency"],
        provinces: ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK"],
      },
      {
        provider: "Manulife", plan_name: "FlexCare Health", base_price: 125, plan_type: "individual",
        family_option: false, deductible: 50, coverage_limit: 150000, smoker_allowed: true,
        drug_coverage_pct: 80, drug_annual_cap: 7500, drug_deductible: 25,
        dental_basic_pct: 80, dental_major_pct: 50, dental_annual_limit: 2000, dental_orthodontic_limit: 1000,
        vision_exam_amount: 100, vision_eyewear_amount: 300, vision_frequency: "every 24 months",
        massage_per_visit: 60, massage_annual_max: 750, massage_visit_limit: 15,
        chiro_per_visit: 50, chiro_annual_max: 600, chiro_visit_limit: 12,
        physio_per_visit: 60, physio_annual_max: 750, physio_visit_limit: 15,
        rating: 4.0, highlights: ["Nationwide coverage", "Online claims", "Mental health support"],
        provinces: ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK", "NT", "NU", "YT"],
      },
      {
        provider: "Manulife", plan_name: "Premium Family Plus", base_price: 310, plan_type: "family",
        family_option: true, deductible: 0, coverage_limit: 500000, smoker_allowed: true,
        drug_coverage_pct: 100, drug_annual_cap: 15000, drug_deductible: 0,
        dental_basic_pct: 100, dental_major_pct: 80, dental_annual_limit: 5000, dental_orthodontic_limit: 3000,
        vision_exam_amount: 150, vision_eyewear_amount: 500, vision_frequency: "every 12 months",
        massage_per_visit: 100, massage_annual_max: 1500, massage_visit_limit: 25,
        chiro_per_visit: 80, chiro_annual_max: 1200, chiro_visit_limit: 20,
        physio_per_visit: 100, physio_annual_max: 1500, physio_visit_limit: 25,
        rating: 4.8, highlights: ["100% drug coverage", "Annual vision", "Premium paramedical"],
        provinces: ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK", "NT", "NU", "YT"],
      },
      {
        provider: "Canada Life", plan_name: "Core Health Plan", base_price: 95, plan_type: "individual",
        family_option: false, deductible: 150, coverage_limit: 75000, smoker_allowed: true,
        drug_coverage_pct: 70, drug_annual_cap: 4000, drug_deductible: 75,
        dental_basic_pct: 70, dental_major_pct: 50, dental_annual_limit: 1200, dental_orthodontic_limit: 0,
        vision_exam_amount: 75, vision_eyewear_amount: 150, vision_frequency: "every 24 months",
        massage_per_visit: 40, massage_annual_max: 400, massage_visit_limit: 10,
        chiro_per_visit: 35, chiro_annual_max: 350, chiro_visit_limit: 10,
        physio_per_visit: 45, physio_annual_max: 450, physio_visit_limit: 10,
        rating: 3.2, highlights: ["Budget-friendly", "Quick approval"],
        provinces: ["AB", "BC", "ON", "QC", "MB", "SK"],
      },
      {
        provider: "Canada Life", plan_name: "Complete Coverage", base_price: 198, plan_type: "couple",
        family_option: true, deductible: 50, coverage_limit: 200000, smoker_allowed: true,
        drug_coverage_pct: 85, drug_annual_cap: 8000, drug_deductible: 25,
        dental_basic_pct: 85, dental_major_pct: 60, dental_annual_limit: 2500, dental_orthodontic_limit: 1500,
        vision_exam_amount: 100, vision_eyewear_amount: 350, vision_frequency: "every 24 months",
        massage_per_visit: 65, massage_annual_max: 800, massage_visit_limit: 15,
        chiro_per_visit: 55, chiro_annual_max: 700, chiro_visit_limit: 12,
        physio_per_visit: 65, physio_annual_max: 800, physio_visit_limit: 15,
        rating: 4.1, highlights: ["Couples plan", "Dental orthodontics", "Travel coverage"],
        provinces: ["AB", "BC", "ON", "QC", "MB", "SK", "NB", "NS"],
      },
      {
        provider: "Sun Life", plan_name: "My Health Starter", base_price: 78, plan_type: "individual",
        family_option: false, deductible: 200, coverage_limit: 50000, smoker_allowed: true,
        drug_coverage_pct: 70, drug_annual_cap: 3000, drug_deductible: 100,
        dental_basic_pct: 70, dental_major_pct: 0, dental_annual_limit: 1000, dental_orthodontic_limit: 0,
        vision_exam_amount: 50, vision_eyewear_amount: 150, vision_frequency: "every 24 months",
        massage_per_visit: 40, massage_annual_max: 300, massage_visit_limit: 8,
        chiro_per_visit: 35, chiro_annual_max: 300, chiro_visit_limit: 8,
        physio_per_visit: 40, physio_annual_max: 300, physio_visit_limit: 8,
        rating: 3.0, highlights: ["Lowest premium", "Easy enrollment"],
        provinces: ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK"],
      },
      {
        provider: "Sun Life", plan_name: "Health Advantage Plus", base_price: 175, plan_type: "family",
        family_option: true, deductible: 50, coverage_limit: 200000, smoker_allowed: true,
        drug_coverage_pct: 85, drug_annual_cap: 8000, drug_deductible: 25,
        dental_basic_pct: 85, dental_major_pct: 60, dental_annual_limit: 2500, dental_orthodontic_limit: 1500,
        vision_exam_amount: 100, vision_eyewear_amount: 350, vision_frequency: "every 24 months",
        massage_per_visit: 70, massage_annual_max: 900, massage_visit_limit: 15,
        chiro_per_visit: 55, chiro_annual_max: 700, chiro_visit_limit: 12,
        physio_per_visit: 70, physio_annual_max: 900, physio_visit_limit: 15,
        rating: 4.2, highlights: ["Family dental", "High drug cap", "Wellness rewards"],
        provinces: ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK"],
      },
      {
        provider: "Sun Life", plan_name: "Elite Comprehensive", base_price: 340, plan_type: "family",
        family_option: true, deductible: 0, coverage_limit: 750000, smoker_allowed: false,
        drug_coverage_pct: 100, drug_annual_cap: 20000, drug_deductible: 0,
        dental_basic_pct: 100, dental_major_pct: 80, dental_annual_limit: 5000, dental_orthodontic_limit: 3500,
        vision_exam_amount: 150, vision_eyewear_amount: 500, vision_frequency: "every 12 months",
        massage_per_visit: 100, massage_annual_max: 2000, massage_visit_limit: 30,
        chiro_per_visit: 80, chiro_annual_max: 1500, chiro_visit_limit: 25,
        physio_per_visit: 100, physio_annual_max: 2000, physio_visit_limit: 30,
        rating: 4.9, highlights: ["Top-tier coverage", "No limits on drugs", "Concierge support"],
        provinces: ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK"],
      },
      {
        provider: "GMS", plan_name: "ExtendaPlan Basic", base_price: 72, plan_type: "individual",
        family_option: false, deductible: 200, coverage_limit: 50000, smoker_allowed: true,
        drug_coverage_pct: 70, drug_annual_cap: 3000, drug_deductible: 100,
        dental_basic_pct: 60, dental_major_pct: 0, dental_annual_limit: 750, dental_orthodontic_limit: 0,
        vision_exam_amount: 50, vision_eyewear_amount: 100, vision_frequency: "every 24 months",
        massage_per_visit: 35, massage_annual_max: 250, massage_visit_limit: 8,
        chiro_per_visit: 30, chiro_annual_max: 250, chiro_visit_limit: 8,
        physio_per_visit: 35, physio_annual_max: 250, physio_visit_limit: 8,
        rating: 2.8, highlights: ["No waiting period", "Simple claims"],
        provinces: ["AB", "SK", "MB", "ON"],
      },
      {
        provider: "GMS", plan_name: "ExtendaPlan Enhanced", base_price: 145, plan_type: "family",
        family_option: true, deductible: 75, coverage_limit: 150000, smoker_allowed: true,
        drug_coverage_pct: 80, drug_annual_cap: 6000, drug_deductible: 50,
        dental_basic_pct: 80, dental_major_pct: 50, dental_annual_limit: 1750, dental_orthodontic_limit: 1000,
        vision_exam_amount: 75, vision_eyewear_amount: 250, vision_frequency: "every 24 months",
        massage_per_visit: 55, massage_annual_max: 600, massage_visit_limit: 12,
        chiro_per_visit: 45, chiro_annual_max: 500, chiro_visit_limit: 12,
        physio_per_visit: 55, physio_annual_max: 600, physio_visit_limit: 12,
        rating: 3.6, highlights: ["Family coverage", "Dental included", "Travel emergency"],
        provinces: ["AB", "SK", "MB", "ON", "BC"],
      },
      {
        provider: "Desjardins", plan_name: "Assurance Essentielle", base_price: 105, plan_type: "individual",
        family_option: false, deductible: 75, coverage_limit: 100000, smoker_allowed: true,
        drug_coverage_pct: 80, drug_annual_cap: 5000, drug_deductible: 50,
        dental_basic_pct: 80, dental_major_pct: 50, dental_annual_limit: 1500, dental_orthodontic_limit: 0,
        vision_exam_amount: 75, vision_eyewear_amount: 200, vision_frequency: "every 24 months",
        massage_per_visit: 50, massage_annual_max: 500, massage_visit_limit: 10,
        chiro_per_visit: 45, chiro_annual_max: 450, chiro_visit_limit: 10,
        physio_per_visit: 50, physio_annual_max: 500, physio_visit_limit: 10,
        rating: 3.7, highlights: ["Bilingual service", "Quick claims", "Quebec specialist"],
        provinces: ["QC", "ON", "NB"],
      },
      {
        provider: "Desjardins", plan_name: "Protection Compl\u00e8te", base_price: 265, plan_type: "family",
        family_option: true, deductible: 0, coverage_limit: 300000, smoker_allowed: true,
        drug_coverage_pct: 90, drug_annual_cap: 12000, drug_deductible: 0,
        dental_basic_pct: 90, dental_major_pct: 70, dental_annual_limit: 3500, dental_orthodontic_limit: 2500,
        vision_exam_amount: 125, vision_eyewear_amount: 400, vision_frequency: "every 24 months",
        massage_per_visit: 80, massage_annual_max: 1200, massage_visit_limit: 20,
        chiro_per_visit: 65, chiro_annual_max: 1000, chiro_visit_limit: 18,
        physio_per_visit: 80, physio_annual_max: 1200, physio_visit_limit: 20,
        rating: 4.4, highlights: ["Zero deductible", "High orthodontic", "Bilingual app"],
        provinces: ["QC", "ON", "NB", "NS"],
      },
      {
        provider: "iA Financial", plan_name: "Value Health", base_price: 82, plan_type: "individual",
        family_option: false, deductible: 150, coverage_limit: 75000, smoker_allowed: true,
        drug_coverage_pct: 70, drug_annual_cap: 3500, drug_deductible: 75,
        dental_basic_pct: 70, dental_major_pct: 0, dental_annual_limit: 1000, dental_orthodontic_limit: 0,
        vision_exam_amount: 50, vision_eyewear_amount: 150, vision_frequency: "every 24 months",
        massage_per_visit: 40, massage_annual_max: 350, massage_visit_limit: 8,
        chiro_per_visit: 35, chiro_annual_max: 300, chiro_visit_limit: 8,
        physio_per_visit: 40, physio_annual_max: 350, physio_visit_limit: 8,
        rating: 3.1, highlights: ["Affordable", "Online portal", "Fast approval"],
        provinces: ["QC", "ON", "AB", "BC"],
      },
      {
        provider: "iA Financial", plan_name: "Complete Health Plus", base_price: 215, plan_type: "family",
        family_option: true, deductible: 25, coverage_limit: 250000, smoker_allowed: true,
        drug_coverage_pct: 85, drug_annual_cap: 9000, drug_deductible: 25,
        dental_basic_pct: 85, dental_major_pct: 65, dental_annual_limit: 2750, dental_orthodontic_limit: 2000,
        vision_exam_amount: 100, vision_eyewear_amount: 350, vision_frequency: "every 24 months",
        massage_per_visit: 70, massage_annual_max: 900, massage_visit_limit: 15,
        chiro_per_visit: 55, chiro_annual_max: 700, chiro_visit_limit: 12,
        physio_per_visit: 70, physio_annual_max: 900, physio_visit_limit: 15,
        rating: 4.0, highlights: ["Family dental", "Low deductible", "Mental health"],
        provinces: ["QC", "ON", "AB", "BC", "MB", "SK"],
      },
      {
        provider: "GreenShield", plan_name: "GSC Starter", base_price: 85, plan_type: "individual",
        family_option: false, deductible: 100, coverage_limit: 100000, smoker_allowed: true,
        drug_coverage_pct: 75, drug_annual_cap: 4000, drug_deductible: 50,
        dental_basic_pct: 75, dental_major_pct: 40, dental_annual_limit: 1250, dental_orthodontic_limit: 0,
        vision_exam_amount: 75, vision_eyewear_amount: 200, vision_frequency: "every 24 months",
        massage_per_visit: 45, massage_annual_max: 450, massage_visit_limit: 10,
        chiro_per_visit: 40, chiro_annual_max: 400, chiro_visit_limit: 10,
        physio_per_visit: 50, physio_annual_max: 500, physio_visit_limit: 10,
        rating: 3.4, highlights: ["Digital-first", "Fast claims", "Wellness app"],
        provinces: ["ON", "BC", "AB", "QC", "MB", "SK", "NS", "NB"],
      },
      {
        provider: "GreenShield", plan_name: "GSC Health Plus", base_price: 195, plan_type: "couple",
        family_option: true, deductible: 50, coverage_limit: 200000, smoker_allowed: true,
        drug_coverage_pct: 85, drug_annual_cap: 8500, drug_deductible: 25,
        dental_basic_pct: 85, dental_major_pct: 60, dental_annual_limit: 2500, dental_orthodontic_limit: 1500,
        vision_exam_amount: 100, vision_eyewear_amount: 350, vision_frequency: "every 24 months",
        massage_per_visit: 65, massage_annual_max: 850, massage_visit_limit: 15,
        chiro_per_visit: 55, chiro_annual_max: 700, chiro_visit_limit: 12,
        physio_per_visit: 65, physio_annual_max: 850, physio_visit_limit: 15,
        rating: 4.0, highlights: ["Couples plan", "Virtual care", "Pharmacy network"],
        provinces: ["ON", "BC", "AB", "QC", "MB", "SK", "NS", "NB"],
      },
      {
        provider: "Equitable Life", plan_name: "HealthConnex Basic", base_price: 92, plan_type: "individual",
        family_option: false, deductible: 100, coverage_limit: 100000, smoker_allowed: true,
        drug_coverage_pct: 75, drug_annual_cap: 4500, drug_deductible: 50,
        dental_basic_pct: 75, dental_major_pct: 50, dental_annual_limit: 1500, dental_orthodontic_limit: 0,
        vision_exam_amount: 75, vision_eyewear_amount: 200, vision_frequency: "every 24 months",
        massage_per_visit: 50, massage_annual_max: 500, massage_visit_limit: 10,
        chiro_per_visit: 40, chiro_annual_max: 400, chiro_visit_limit: 10,
        physio_per_visit: 50, physio_annual_max: 500, physio_visit_limit: 10,
        rating: 3.3, highlights: ["Guaranteed acceptance", "Stable premiums"],
        provinces: ["ON", "AB", "BC", "QC"],
      },
      {
        provider: "Equitable Life", plan_name: "HealthConnex Comprehensive", base_price: 225, plan_type: "family",
        family_option: true, deductible: 0, coverage_limit: 300000, smoker_allowed: true,
        drug_coverage_pct: 90, drug_annual_cap: 10000, drug_deductible: 0,
        dental_basic_pct: 90, dental_major_pct: 70, dental_annual_limit: 3000, dental_orthodontic_limit: 2000,
        vision_exam_amount: 100, vision_eyewear_amount: 400, vision_frequency: "every 24 months",
        massage_per_visit: 75, massage_annual_max: 1000, massage_visit_limit: 18,
        chiro_per_visit: 60, chiro_annual_max: 800, chiro_visit_limit: 15,
        physio_per_visit: 75, physio_annual_max: 1000, physio_visit_limit: 18,
        rating: 4.3, highlights: ["Zero deductible", "High dental", "Family friendly"],
        provinces: ["ON", "AB", "BC", "QC", "MB", "SK"],
      },
      {
        provider: "SSQ Insurance", plan_name: "SSQ Individuel Sant\u00e9", base_price: 110, plan_type: "individual",
        family_option: false, deductible: 75, coverage_limit: 100000, smoker_allowed: true,
        drug_coverage_pct: 80, drug_annual_cap: 5500, drug_deductible: 50,
        dental_basic_pct: 80, dental_major_pct: 50, dental_annual_limit: 1750, dental_orthodontic_limit: 500,
        vision_exam_amount: 75, vision_eyewear_amount: 250, vision_frequency: "every 24 months",
        massage_per_visit: 55, massage_annual_max: 550, massage_visit_limit: 10,
        chiro_per_visit: 45, chiro_annual_max: 450, chiro_visit_limit: 10,
        physio_per_visit: 55, physio_annual_max: 550, physio_visit_limit: 10,
        rating: 3.6, highlights: ["Quebec focused", "Bilingual", "Competitive rates"],
        provinces: ["QC", "ON"],
      },
    ];

    const createdPlans: InsurancePlan[] = [];
    for (const data of planData) {
      const plan = await InsurancePlan.create({
        provider_id: providerMap[data.provider],
        plan_name: data.plan_name,
        coverage_type: "health",
        base_price: data.base_price,
        min_age: 18,
        max_age: 65,
        smoker_allowed: data.smoker_allowed,
        coverage_limit: data.coverage_limit,
        description: `${data.plan_name} by ${data.provider} — comprehensive health and dental insurance for Canadians.`,
        plan_type: data.plan_type,
        family_option: data.family_option,
        deductible: data.deductible,
        drug_coverage_pct: data.drug_coverage_pct,
        drug_annual_cap: data.drug_annual_cap,
        drug_deductible: data.drug_deductible,
        dental_basic_pct: data.dental_basic_pct,
        dental_major_pct: data.dental_major_pct,
        dental_annual_limit: data.dental_annual_limit,
        dental_orthodontic_limit: data.dental_orthodontic_limit,
        vision_exam_amount: data.vision_exam_amount,
        vision_eyewear_amount: data.vision_eyewear_amount,
        vision_frequency: data.vision_frequency,
        massage_per_visit: data.massage_per_visit,
        massage_annual_max: data.massage_annual_max,
        massage_visit_limit: data.massage_visit_limit,
        chiro_per_visit: data.chiro_per_visit,
        chiro_annual_max: data.chiro_annual_max,
        chiro_visit_limit: data.chiro_visit_limit,
        physio_per_visit: data.physio_per_visit,
        physio_annual_max: data.physio_annual_max,
        physio_visit_limit: data.physio_visit_limit,
        rating: data.rating,
        highlights: data.highlights,
      });
      createdPlans.push(plan);

      for (const code of data.provinces) {
        await PlanProvince.create({
          plan_id: plan.id,
          province_code: code,
          province_name: PROVINCE_NAMES[code] || code,
        });
      }
    }

    // ── Plan Add-ons ──────────────────────────────────────────────────────
    const addonDefinitions = [
      { addon_name: "vision", addon_price: 15, description: "Enhanced vision coverage with annual eye exams and premium eyewear allowance" },
      { addon_name: "prescription", addon_price: 20, description: "Extended prescription drug coverage with higher annual caps" },
      { addon_name: "dental_plus", addon_price: 25, description: "Enhanced dental coverage including cosmetic procedures" },
      { addon_name: "travel", addon_price: 18, description: "International travel medical emergency coverage" },
      { addon_name: "mental_health", addon_price: 22, description: "Expanded mental health and counselling coverage" },
      { addon_name: "wellness", addon_price: 12, description: "Wellness spending account for gym, fitness, and nutrition" },
    ];

    for (const plan of createdPlans) {
      const numAddons = 3 + Math.floor(Math.abs(plan.id * 7 % 3));
      const selectedAddons = addonDefinitions.slice(0, numAddons);
      for (const addon of selectedAddons) {
        const priceVariation = Math.round((plan.id % 5) * 2);
        await PlanAddon.create({
          plan_id: plan.id,
          addon_name: addon.addon_name,
          addon_price: addon.addon_price + priceVariation,
          description: addon.description,
        });
      }
    }

    // ── Pricing Modifiers ─────────────────────────────────────────────────
    for (const plan of createdPlans) {
      const ageModifiers = [
        { modifier_name: "Young Adult (18-25)", age_min: 18, age_max: 25, modifier_type: "flat" as const, modifier_value: 10, condition_key: "age", condition_value: "range" },
        { modifier_name: "Adult (26-40)", age_min: 26, age_max: 40, modifier_type: "flat" as const, modifier_value: 25, condition_key: "age", condition_value: "range" },
        { modifier_name: "Middle Age (41-55)", age_min: 41, age_max: 55, modifier_type: "flat" as const, modifier_value: 50, condition_key: "age", condition_value: "range" },
        { modifier_name: "Senior (56-65)", age_min: 56, age_max: 65, modifier_type: "flat" as const, modifier_value: 85, condition_key: "age", condition_value: "range" },
      ];

      for (const mod of ageModifiers) {
        await PricingModifier.create({ plan_id: plan.id, ...mod });
      }

      await PricingModifier.create({
        plan_id: plan.id,
        modifier_name: "Smoker Surcharge",
        age_min: null,
        age_max: null,
        modifier_type: "percentage",
        modifier_value: 20,
        condition_key: "smoker",
        condition_value: "yes",
      });
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

seed();
