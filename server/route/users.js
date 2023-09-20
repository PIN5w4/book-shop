const express  = require('express');
const router = express.Router();
const usersController = require('../controller/users');

router.post('/create_user',usersController.createNewUser);
router.get('/login',usersController.login);
router.get('/getUserById',usersController.getUserById);
router.get('/get_all',usersController.getAll);
router.patch('/update_user',usersController.updateUser);

module.exports = router;