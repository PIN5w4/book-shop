const express  = require('express');
const router = express.Router();
const publicerController = require('../controller/publicer');

router.get('/navibar',publicerController.navibar);
router.get('/get_all',publicerController.getAll);
router.get('/get_code',publicerController.getCode);
router.post('/insert_publicer',publicerController.insertPublicer);
router.patch('/update_publicer',publicerController.updatePublicer);


module.exports = router;