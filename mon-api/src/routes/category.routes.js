const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const { validateCategory } = require('../middlewares/validate.middleware');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getOne);
router.post('/', validateCategory, categoryController.store);
router.put('/:id', validateCategory, categoryController.update);
router.delete('/:id', categoryController.destroy);

module.exports = router;