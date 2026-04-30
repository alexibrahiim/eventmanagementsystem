const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Admin: list all users
router.get('/', protect, isAdmin, userController.getUsers);

// Admin: create user
router.get('/create', protect, isAdmin, userController.showCreateUser);
router.post('/create', protect, isAdmin, userController.createUser);

// Admin: edit user
router.get('/edit/:id', protect, isAdmin, userController.showEditUser);
router.post('/edit/:id', protect, isAdmin, userController.updateUser);

// Admin: delete user
router.post('/delete/:id', protect, isAdmin, userController.deleteUser);

// Admin: view one user
// Important: this route must stay LAST
router.get('/:id', protect, isAdmin, userController.getUserDetails);

module.exports = router;