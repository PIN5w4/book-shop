const express  = require('express');
const router = express.Router();
const uploadController = require('../controller/upload');

router.post('/payment',uploadController.uploadFilePayment);
router.post('/book',uploadController.uploadFileBook);


module.exports = router;