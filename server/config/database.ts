import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || "";

let sequelize: Sequelize;

if (DATABASE_URL && DATABASE_URL.startsWith("postgresql")) {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions:
      process.env.NODE_ENV === "production"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  console.warn(
    "WARNING: DATABASE_URL is not set or invalid. Database features will be unavailable."
  );
  // Create a minimal Sequelize instance with postgres dialect but no real connection
  // This allows the models to be defined without crashing
  sequelize = new Sequelize({
    dialect: "postgres",
    host: "localhost",
    port: 5432,
    database: "healthsync_dummy",
    username: "dummy",
    password: "dummy",
    logging: false,
  });
}

export default sequelize;
