import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import sequelize from "../config/database.js";

class InsurancePlan extends Model<InferAttributes<InsurancePlan>, InferCreationAttributes<InsurancePlan>> {
  declare id: CreationOptional<number>;
  declare provider_id: number;
  declare plan_name: string;
  declare coverage_type: string;
  declare base_price: number;
  declare min_age: number;
  declare max_age: number;
  declare smoker_allowed: boolean;
  declare coverage_limit: number;
  declare description: string | null;
  declare plan_type: string;
  declare family_option: boolean;
  declare deductible: number;
  declare drug_coverage_pct: number;
  declare drug_annual_cap: number;
  declare drug_deductible: number;
  declare dental_basic_pct: number;
  declare dental_major_pct: number;
  declare dental_annual_limit: number;
  declare dental_orthodontic_limit: number;
  declare vision_exam_amount: number;
  declare vision_eyewear_amount: number;
  declare vision_frequency: string;
  declare massage_per_visit: number;
  declare massage_annual_max: number;
  declare massage_visit_limit: number;
  declare chiro_per_visit: number;
  declare chiro_annual_max: number;
  declare chiro_visit_limit: number;
  declare physio_per_visit: number;
  declare physio_annual_max: number;
  declare physio_visit_limit: number;
  declare rating: number;
  declare highlights: string[];
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

InsurancePlan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "providers", key: "id" },
    },
    plan_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    coverage_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "health",
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    min_age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 18,
    },
    max_age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 65,
    },
    smoker_allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    coverage_limit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 100000,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plan_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "individual",
    },
    family_option: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deductible: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    drug_coverage_pct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 80,
    },
    drug_annual_cap: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 5000,
    },
    drug_deductible: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50,
    },
    dental_basic_pct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 80,
    },
    dental_major_pct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
    },
    dental_annual_limit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1500,
    },
    dental_orthodontic_limit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    vision_exam_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 75,
    },
    vision_eyewear_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 200,
    },
    vision_frequency: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "every 24 months",
    },
    massage_per_visit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50,
    },
    massage_annual_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 500,
    },
    massage_visit_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    chiro_per_visit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 40,
    },
    chiro_annual_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 400,
    },
    chiro_visit_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    physio_per_visit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50,
    },
    physio_annual_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 500,
    },
    physio_visit_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 3.0,
    },
    highlights: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "insurance_plans",
    timestamps: true,
  }
);

export default InsurancePlan;
