const Category = require('../models/category.model');
const asyncHandler = require('../utils/asyncHandler');
const response = require('../utils/response');

const getAll = asyncHandler(async (req, res) => {
    const categories = await Category.findAll();
    return response.success(res, categories, 'Categories retrieved successfully');
});

const getOne = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return response.notFound(res, 'Category not found');
    }

    return response.success(res, category, 'Category retrieved successfully');
});

const store = asyncHandler(async (req, res) => {
    try {
        const category = await Category.create(req.body);
        return response.created(res, category, 'Category created successfully');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Category name already exists',
            });
        }
        throw err;
    }
});

const update = asyncHandler(async (req, res) => {
    try {
        const category = await Category.update(req.params.id, req.body);

        if (!category) {
            return response.notFound(res, 'Category not found');
        }

        return response.success(res, category, 'Category updated successfully');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Category name already exists',
            });
        }
        throw err;
    }
});

const destroy = asyncHandler(async (req, res) => {
    const deleted = await Category.remove(req.params.id);

    if (!deleted) {
        return response.notFound(res, 'Category not found');
    }

    return response.success(res, null, 'Category deleted successfully');
});

module.exports = {
    getAll,
    getOne,
    store,
    update,
    destroy,
};