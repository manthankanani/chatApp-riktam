const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { isTokenRevoked } = require('../middleware/auth');


// Route for admin login
router.post('/admin/login', authController.adminLogin);
router.post('/user/login', authController.userLogin);
router.post('/logout', isTokenRevoked, authController.userLogout);

module.exports = router;
