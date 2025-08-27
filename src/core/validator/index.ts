import { createApiResponse } from "@/shared/util";
import { Request, Response } from "express";
import z from "zod";

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: any) => {
    try {
      const dataToValidate = {
        ...req.body,
        ...req.query,
        ...req.params,
      };

      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errors = result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);

        return res.status(400).json(createApiResponse(false, "Validation failed", null, errors));
      }

      // Merge validated data back to request
      Object.assign(req.body, result.data);
      Object.assign(req.query, result.data);

      next();
    } catch (error) {
      return res.status(500).json(createApiResponse(false, "Internal validation error"));
    }
  };
};
