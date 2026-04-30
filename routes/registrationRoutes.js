const express = require('express');
const router = express.Router();

const registrationController = require('../controllers/registrationController');
const { protect, isAdmin, isUser } = require('../middleware/authMiddleware');

router.get('/', protect, isAdmin, registrationController.getAllRegistrations);

router.get('/my', protect, isUser, registrationController.getMyRegistrations);

router.post('/register/:eventId', protect, isUser, registrationController.registerForEvent);

router.post('/cancel/:eventId', protect, isUser, registrationController.cancelRegistration);

router.post('/delete/:id', protect, isAdmin, registrationController.deleteRegistration);

module.exports = router;