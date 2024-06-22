const express = require('express');
const router = express.Router();

const collectionController = require('../../controllers/store/collection');

router.get('/', collectionController.getCollections);
router.get('/:slug/:store', collectionController.getCollectionsBySlug);
router.get('/:store',collectionController.getAllStoreCollections)
module.exports = router;
