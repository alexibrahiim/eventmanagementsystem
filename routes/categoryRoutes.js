const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, isAdmin, categoryController.getCategories);

router.get('/create', protect, isAdmin, categoryController.showCreateCategory);
router.post('/create', protect, isAdmin, categoryController.createCategory);

router.get('/edit/:id', protect, isAdmin, categoryController.showEditCategory);
router.post('/edit/:id', protect, isAdmin, categoryController.updateCategory);

router.post('/delete/:id', protect, isAdmin, categoryController.deleteCategory);

module.exports = router;