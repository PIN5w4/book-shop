const express  = require('express');
const router = express.Router();
const paymentController = require('../controller/payment');

router.post('/insert_purchase',paymentController.insertPayment);
router.get('/get_payment_table_list',paymentController.getPaymentTableList);
router.get('/get_payment_by_id',paymentController.getPaymentById);
router.patch('/confirm_payment',paymentController.confirmPayment)

module.exports = router;