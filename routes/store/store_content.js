const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/store/content');

router.get('/', contentController.getAllStoreContents);
router.get('/:slug/:store', contentController.getContentBySlug);
router.get('/:store',contentController.getAllStoreContents)

module.exports = router;
