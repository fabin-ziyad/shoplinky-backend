const express = require('express');
const router = express.Router();
const mainController = require('../../controllers/store/main');

router.get('/:store', mainController.getMyStoreData);

module.exports = router;
