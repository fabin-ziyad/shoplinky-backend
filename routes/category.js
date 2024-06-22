const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/create', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.post('/update/:id', categoryController.updateCategory);
router.post('/addItems/:slug', categoryController.addItemToCategory);
router.post('/removeItems/:slug', categoryController.removeItemFromCategory);
router.post('/delete/:slug', categoryController.deleteCategory);
router.post('/toggle/:slug', categoryController.toggleStatus);
module.exports = router;

