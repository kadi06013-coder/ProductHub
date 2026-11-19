const Product = require('../models/product.model');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, notFound } = require('../utils/response');

// GET /api/products
const getAll = asyncHandler(async (req, res) => {
  const { page, limit, category_id, is_active, search } = req.query;
  const result = await Product.findAll({
    page: page || 1,
    limit: limit || 10,
    category_id: category_id !== undefined ? Number(category_id) : undefined,
    is_active: is_active !== undefined ? Number(is_active) : undefined,
    search,
  });
  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully',
    data: result.data,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    },
  });
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

// PUT /api/products/:id
const update = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) return notFound(res, 'Product not found');
  const product = await Product.update(req.params.id, req.body);
  return success(res, product, 'Product updated successfully');
});

// PATCH /api/products/:id
const patch = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) return notFound(res, 'Product not found');
  const product = await Product.update(req.params.id, req.body);
  return success(res, product, 'Product patched successfully');
});

// DELETE /api/products/:id
const destroy = asyncHandler(async (req, res) => {
  const deleted = await Product.remove(req.params.id);
  if (!deleted) return notFound(res, 'Product not found');
  return success(res, null, 'Product deleted successfully');
});

module.exports = { getAll, getOne, store, update, patch, destroy };
