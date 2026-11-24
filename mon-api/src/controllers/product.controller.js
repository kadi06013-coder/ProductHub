const Product = require('../models/product.model');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, notFound } = require('../utils/response');

// GET /api/products
const getAll = asyncHandler(async (req, res) => {
  const result = await Product.findAll(req.validatedQuery);
  return success(res, result.data, 'Products retrieved successfully', 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

// GET /api/products/stats
const getStats = asyncHandler(async (req, res) => {
  const stats = await Product.getStats();
  return success(res, stats, 'Product statistics retrieved successfully');
});

// GET /api/products/:id
const getOne = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return notFound(res, 'Product not found');
  return success(res, product, 'Product retrieved successfully');
});

// POST /api/products
const store = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  return created(res, product, 'Product created successfully');
});

// PUT /api/products/:id  (Product.update returns null when the id does not exist)
const update = asyncHandler(async (req, res) => {
  const product = await Product.update(req.params.id, req.body);
  if (!product) return notFound(res, 'Product not found');
  return success(res, product, 'Product updated successfully');
});

// PATCH /api/products/:id
const patch = asyncHandler(async (req, res) => {
  const product = await Product.update(req.params.id, req.body);
  if (!product) return notFound(res, 'Product not found');
  return success(res, product, 'Product patched successfully');
});

// DELETE /api/products/:id
const destroy = asyncHandler(async (req, res) => {
  const deleted = await Product.remove(req.params.id);
  if (!deleted) return notFound(res, 'Product not found');
  return success(res, null, 'Product deleted successfully');
});

module.exports = { getAll, getStats, getOne, store, update, patch, destroy };
