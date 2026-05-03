import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

/**
 * Validates req.body against a Zod schema.
 * Replaces req.body with the parsed (typed + coerced) result on success.
 * Returns 400 with flattened Zod errors on failure.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten(),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
