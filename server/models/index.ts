import sequelize from "../config/database.js";
import Provider from "./Provider.js";
import InsurancePlan from "./InsurancePlan.js";
import PlanProvince from "./PlanProvince.js";
import PlanAddon from "./PlanAddon.js";
import PricingModifier from "./PricingModifier.js";

// ── Associations ──────────────────────────────────────────────────────────

// Provider → InsurancePlan (1:N)
Provider.hasMany(InsurancePlan, { foreignKey: "provider_id", as: "plans" });
InsurancePlan.belongsTo(Provider, { foreignKey: "provider_id", as: "provider" });

// InsurancePlan → PlanProvince (1:N)
InsurancePlan.hasMany(PlanProvince, { foreignKey: "plan_id", as: "provinces" });
PlanProvince.belongsTo(InsurancePlan, { foreignKey: "plan_id", as: "plan" });

// InsurancePlan → PlanAddon (1:N)
InsurancePlan.hasMany(PlanAddon, { foreignKey: "plan_id", as: "addons" });
PlanAddon.belongsTo(InsurancePlan, { foreignKey: "plan_id", as: "plan" });

// InsurancePlan → PricingModifier (1:N)
InsurancePlan.hasMany(PricingModifier, { foreignKey: "plan_id", as: "pricing_modifiers" });
PricingModifier.belongsTo(InsurancePlan, { foreignKey: "plan_id", as: "plan" });

export { sequelize, Provider, InsurancePlan, PlanProvince, PlanAddon, PricingModifier };
