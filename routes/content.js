const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const contentController = require('../controllers/contentController');

router.post('/create', upload.single('image'), contentController.createContent);
router.get('/', contentController.getAllContent);
router.get('/:slug', contentController.getContentBySlug);
router.post('/update/:slug', contentController.updateContent);
router.post('/addProduct/:slug', contentController.addProductToContent);
router.post('/removeProduct/:slug', contentController.removeProductFromContent);
router.post('/toggle/:slug', contentController.toggleStatus);
router.delete('/delete/:slug', contentController.deleteContent);

module.exports = router;

