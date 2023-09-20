const express  = require('express');
const router = express.Router();
const reportController = require('../controller/report');

router.get('/export_excel',reportController.exportExcel);
router.get('/by_gender',reportController.byGender);
router.get('/category_ratio',reportController.categoryRatio);
router.get('/accumulate_income',reportController.accumulateIncome);

module.exports = router;