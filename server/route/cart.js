const express  = require('express');
const router = express.Router();
const cartController = require('../controller/cart');

router.get('/check_exist',cartController.checkExist);
router.get('/card_list',cartController.getCartList);
router.post('/add_to_cart',cartController.addToCart);
router.patch('/remove_item',cartController.removeItem);
router.get('/cart_list_by_purchase_order',cartController.getCartListByPurchaseOrder);

module.exports = router;