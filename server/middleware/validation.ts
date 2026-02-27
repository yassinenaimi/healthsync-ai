import { body, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

/**
 * Valid Canadian province codes
 */
const VALID_PROVINCES = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT",
];

/**
 * Validation rules for POST /compare
 */
export const compareValidation = [
  body("age")
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be an integer between 0 and 120"),

  body("gender")
    .optional()
    .isString()
    .isIn(["male", "female", "other", "prefer_not_to_say"])
    .withMessage("Gender must be one of: male, female, other, prefer_not_to_say"),

  body("province")
    .isString()
    .notEmpty()
    .customSanitizer((value: string) => value.toUpperCase().trim())
    .isIn(VALID_PROVINCES)
    .withMessage(`Province must be a valid Canadian province code: ${VALID_PROVINCES.join(", ")}`),

  body("smoking_status")
    .isString()
    .isIn(["smoker", "non-smoker"])
    .withMessage("Smoking status must be 'smoker' or 'non-smoker'"),

  body("budget_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget minimum must be a positive number"),

  body("budget_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget maximum must be a positive number"),

  body("coverage_type")
    .optional()
    .isString()
    .isIn(["health", "dental", "travel", "life", "disability", "critical_illness"])
    .withMessage("Coverage type must be one of: health, dental, travel, life, disability, critical_illness"),

  body("plan_type")
    .optional()
    .isString()
    .isIn(["individual", "couple", "family"])
    .withMessage("Plan type must be one of: individual, couple, family"),

  body("addons")
    .optional()
    .isArray()
    .withMessage("Addons must be an array of strings"),

  body("addons.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each addon must be a non-empty string"),
];

/**
 * Middleware to handle validation errors
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((err) => ({
        field: (err as any).path || (err as any).param,
        message: err.msg,
      })),
    });
  }
  next();
}
