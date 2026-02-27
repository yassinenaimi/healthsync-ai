import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import sequelize from "../config/database.js";

class PlanAddon extends Model<InferAttributes<PlanAddon>, InferCreationAttributes<PlanAddon>> {
  declare id: CreationOptional<number>;
  declare plan_id: number;
  declare addon_name: string;
  declare addon_price: number;
  declare description: string | null;
}

PlanAddon.init(
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
    addon_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    addon_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "plan_addons",
    timestamps: false,
    indexes: [
      {
        fields: ["plan_id"],
      },
    ],
  }
);

export default PlanAddon;
