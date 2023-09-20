const express  = require('express');
const router = express.Router();
const interestedController = require('../controller/interested');

router.get('/is_interested',interestedController.isInterested);
router.post('/interested',interestedController.interested);

module.exports = router;