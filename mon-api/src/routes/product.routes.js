const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');
const { validateCreate, validateUpdate } = require('../middlewares/validate.middleware');

/**
 * @route   GET /api/products
 * @desc    Get all products (paginated, filterable)
 * @query   page, limit, category_id, is_active, search
 */
router.get('/', controller.getAll);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 */
router.get('/:id', controller.getOne);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @body    { name, price, category_id?, description?, stock?, sku?, image_url?, is_active? }
 */
router.post('/', validateCreate, controller.store);

/**
 * @route   PUT /api/products/:id
 * @desc    Full update of a product
 */
router.put('/:id', validateCreate, controller.update);

/**
 * @route   PATCH /api/products/:id
 * @desc    Partial update of a product
 */
router.patch('/:id', validateUpdate, controller.patch);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 */
router.delete('/:id', controller.destroy);

module.exports = router;
