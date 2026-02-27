import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import sequelize from "../config/database.js";

class Provider extends Model<InferAttributes<Provider>, InferCreationAttributes<Provider>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare website: string | null;
  declare contact_email: string | null;
  declare logo_color: string;
  declare logo_url: string | null;
  declare enrollment_base_url: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Provider.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    logo_color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: "#1E40AF",
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    enrollment_base_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "providers",
    timestamps: true,
  }
);

export default Provider;
