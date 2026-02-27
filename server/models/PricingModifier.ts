import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import sequelize from "../config/database.js";

class PricingModifier extends Model<InferAttributes<PricingModifier>, InferCreationAttributes<PricingModifier>> {
  declare id: CreationOptional<number>;
  declare plan_id: number;
  declare modifier_name: string;
  declare age_min: number | null;
  declare age_max: number | null;
  declare modifier_type: "percentage" | "flat";
  declare modifier_value: number;
  declare condition_key: string;
  declare condition_value: string;
}

PricingModifier.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "insurance_plans", key: "id" },
    },
    modifier_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    age_min: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    age_max: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    modifier_type: {
      type: DataTypes.ENUM("percentage", "flat"),
      allowNull: false,
      defaultValue: "flat",
    },
    modifier_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    condition_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "age",
    },
    condition_value: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "any",
    },
  },
  {
    sequelize,
    tableName: "pricing_modifiers",
    timestamps: false,
    indexes: [
      {
        fields: ["plan_id"],
      },
    ],
  }
);

export default PricingModifier;
