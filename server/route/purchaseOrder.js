const express  = require('express');
const router = express.Router();
const purchaseOrderController = require('../controller/purchaseOrder');

router.post('/insert_purchase',purchaseOrderController.insertPurchase);
router.get('/purchase_order_for_payment',purchaseOrderController.getPuchaseOrderForPaymnet);
router.get('/get_purchase_order_by_payment',purchaseOrderController.getPuchaseOrderByPayment);
router.get('/get_purchase_order_for_delivery',purchaseOrderController.getPuchaseOrderForDelivery);
router.get('/get_purchase_order_by_id',purchaseOrderController.getPurchaseById);
router.patch('/delivery',purchaseOrderController.delivery);
router.get('/get_reciept_no',purchaseOrderController.getRecieptNo);

module.exports = router;