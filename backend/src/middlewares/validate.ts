import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

// Generic validator factory: pass a zod schema, get back an Express middleware.
// 'where' tells it which part of the request to validate (body, params, query).
// We default to 'body' because that's the most common case for POST/PUT.
export function validate(
  schema: ZodSchema,
  where: 'body' | 'params' | 'query' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Run the schema; safeParse never throws — it returns { success, data, error }.
    const result = schema.safeParse(req[where]);

    if (!result.success) {
      // Flatten zod's nested errors into something easier for the frontend.
      // .flatten() returns { fieldErrors: { fieldName: ['msg1', 'msg2'] } }.
      const flat = (result.error as ZodError).flatten();
      return res.status(400).json({
        message: 'Validation failed',
        errors: flat.fieldErrors,
      });
    }

    // Replace the request payload with the parsed (and coerced) value.
    // Instead of reassigning the whole object (which fails for query/params),
    // we modify the content of the existing object.
    if (where === 'body') {
      req.body = result.data;
    } else {
      // For query and params, we clear the existing keys and assign the new ones
      // to avoid "only has a getter" errors while still getting coerced values.
      const target = req[where] as Record<string, unknown>;
      for (const key in target) delete target[key];
      Object.assign(target, result.data);
    }
    
    next();
  };
}