import { BadRequestError } from '../errors/ApiError.js';

/**
 * Validate request property against a Zod schema.
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} target 
 */
export const validate = (schema, target = 'body') => (req, res, next) => {
  const parseResult = schema.safeParse(req[target]);
  
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return next(new BadRequestError(`Validation failed for request ${target}`, errorDetails));
  }
  
  // Assign validated data back to request
  const capitalizedTarget = target.charAt(0).toUpperCase() + target.slice(1);
  req[`validated${capitalizedTarget}`] = parseResult.data;
  next();
};

export default validate;
