const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/userController');

router.post('/create', user_controller.signUp);
router.post('/login', user_controller.userLogin);
router.post('/getUser', user_controller.getUserById);
router.post('/check-store-name', user_controller.checkStoreName);
router.post('/overall-data', user_controller.getMyData);
router.post('/getByMail',user_controller.getUserByMail)

module.exports = router;
