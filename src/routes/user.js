const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middleware/auth');

// Route to create a new user (admin-only)
router.post('/admin/users', authMiddleware.isAdmin, userController.createUser);
router.put('/admin/users/:userId', authMiddleware.isAdmin, userController.editUserByAdmin);

module.exports = router;
