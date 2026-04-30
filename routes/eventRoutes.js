const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, eventController.getEvents);

router.get('/create', protect, isAdmin, eventController.showCreateEvent);
router.post('/create', protect, isAdmin, eventController.createEvent);

router.get('/edit/:id', protect, isAdmin, eventController.showEditEvent);
router.post('/edit/:id', protect, isAdmin, eventController.updateEvent);

router.post('/delete/:id', protect, isAdmin, eventController.deleteEvent);

router.get('/:id', protect, eventController.getEventDetails);

module.exports = router;