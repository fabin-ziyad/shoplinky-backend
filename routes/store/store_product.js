const express = require('express');
const router = express.Router();
const productController = require('../../controllers/store/product');

router.get('/', productController.getAllStoreProducts);
router.get('/:id/:store', productController.getProduct);
router.get('/:store', productController.getAllStoreProducts);


module.exports = router;
