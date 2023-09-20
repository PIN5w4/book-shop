const express  = require('express');
const router = express.Router();
const addressController = require('../controller/address');

router.get('/address_by_user_id',addressController.getAddressByUserId);
router.post('/insert_address',addressController.insertAddress);

module.exports = router;