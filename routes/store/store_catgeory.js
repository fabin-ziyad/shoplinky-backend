const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/store/category');

// router.post('/create', categoryController.createCategory);
router.get('/', categoryController.getCategory);
router.get('/:id', categoryController.getCategoryById);
router.post('/create', categoryController.createCategory);

// router.patch('/update/:id', categoryController.updateCategory);
// router.delete('/delete/:id', categoryController.deleteCategory);

module.exports = router;
