import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import sequelize from "../config/database.js";

class PlanProvince extends Model<InferAttributes<PlanProvince>, InferCreationAttributes<PlanProvince>> {
  declare id: CreationOptional<number>;
  declare plan_id: number;
  declare province_code: string;
  declare province_name: string;
}

PlanProvince.init(
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
    province_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    province_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "plan_provinces",
    timestamps: false,
    indexes: [
      {
        fields: ["plan_id", "province_code"],
        unique: true,
      },
      {
        fields: ["province_code"],
      },
    ],
  }
);

export default PlanProvince;
