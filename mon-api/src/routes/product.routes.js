const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');
const {
  validateCreate,
  validateUpdate,
  validateProductQuery,
  validateIdParam,
} = require('../middlewares/validate.middleware');

// Rejects non-numeric ids (e.g. /api/products/abc) with a 400 before any SQL runs.
router.param('id', validateIdParam);

/**
 * @route   GET /api/products
 * @desc    Get all products (paginated, filterable)
 * @query   page, limit (max 100), category_id, is_active, search
 */
router.get('/', validateProductQuery, controller.getAll);

/**
 * @route   GET /api/products/stats
 * @desc    Counters for the dashboard (total / active / out of stock)
 * NOTE: must be declared before '/:id', otherwise "stats" would be read as an id.
 */
router.get('/stats', controller.getStats);

router.get('/:id', controller.getOne);

/**
 * @route   POST /api/products
 * @body    { name, price, category_id?, description?, stock?, sku?, image_url?, is_active? }
 */
router.post('/', validateCreate, controller.store);

/** @route PUT /api/products/:id — full update */
router.put('/:id', validateCreate, controller.update);

/** @route PATCH /api/products/:id — partial update */
router.patch('/:id', validateUpdate, controller.patch);

/** @route DELETE /api/products/:id */
router.delete('/:id', controller.destroy);

module.exports = router;
