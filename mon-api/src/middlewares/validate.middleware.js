const Joi = require('joi');

// ── Schemas ────────────────────────────────────────────────────────────────
const productSchema = Joi.object({
  category_id: Joi.number().integer().positive().allow(null),
  name: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().allow(null, ''),
  price: Joi.number().min(0).precision(2).required(),
  stock: Joi.number().integer().min(0).default(0),
  sku: Joi.string().max(50).allow(null, ''),
  image_url: Joi.string().uri().max(255).allow(null, ''),
  is_active: Joi.number().valid(0, 1).default(1),
});

// PATCH: every field optional, and defaults must NOT be applied
// (otherwise PATCH {name} would silently reset stock to 0 and is_active to 1).
const productPatchSchema = Joi.object({
  category_id: Joi.number().integer().positive().allow(null),
  name: Joi.string().trim().min(2).max(150),
  description: Joi.string().allow(null, ''),
  price: Joi.number().min(0).precision(2),
  stock: Joi.number().integer().min(0),
  sku: Joi.string().max(50).allow(null, ''),
  image_url: Joi.string().uri().max(255).allow(null, ''),
  is_active: Joi.number().valid(0, 1),
}).min(1);

const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category_id: Joi.number().integer().positive(),
  is_active: Joi.number().valid(0, 1),
  search: Joi.string().trim().max(100).allow(''),
});

const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
});

// ── Middleware factories ───────────────────────────────────────────────────
const fail = (res, error) =>
  res.status(400).json({
    success: false,
    message: 'Validation error',
    errors: error.details.map((d) => d.message),
  });

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return fail(res, error);
  req.body = value;
  next();
};

// Express 5: req.query is a read-only getter, so the cleaned query goes on req.validatedQuery.
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) return fail(res, error);
  req.validatedQuery = value;
  next();
};

// Use with router.param('id', validateIdParam)
const validateIdParam = (req, res, next, value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'Validation error', errors: ['"id" must be a positive integer'] });
  }
  req.params.id = id;
  next();
};

module.exports = {
  validateCreate: validateBody(productSchema),
  validateUpdate: validateBody(productPatchSchema),
  validateProductQuery: validateQuery(productQuerySchema),
  validateCategory: validateBody(categorySchema),
  validateIdParam,
};
