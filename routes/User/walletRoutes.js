const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/User/walletController');
const { userProtect } = require('../../middleware/Middleware');

router.get('/', userProtect, walletController.getWallet);
router.post('/add', userProtect, walletController.addToWallet);

module.exports = router;