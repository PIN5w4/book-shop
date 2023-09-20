const express  = require('express');
const router = express.Router();
const categoryController = require('../controller/category');

router.get('/navibar',categoryController.navibar);
router.get('/get_all',categoryController.getAll);
router.get('/get_code',categoryController.getCode);
router.post('/insert_category',categoryController.insertCategory);
router.patch('/update_category',categoryController.updateCategory);

module.exports = router;