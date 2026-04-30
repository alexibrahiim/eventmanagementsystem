const Event = require('../models/Event');
const Category = require('../models/Category');
const Registration = require('../models/Registration');

// View all events
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('category')
            .sort({ date: 1 });

        const registrations = await Registration.find({ user: req.user._id });
        const registeredEventIds = registrations.map(reg => reg.event.toString());

        res.render('events/index', {
            title: 'Events',
            events,
            registeredEventIds,
            error: null
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// View event details
exports.getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('category');

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const registrationCount = await Registration.countDocuments({
            event: event._id
        });

        const existingRegistration = await Registration.findOne({
            user: req.user._id,
            event: event._id
        });

        const isRegistered = !!existingRegistration;
        const isFull = registrationCount >= event.capacity;

        res.render('events/details', {
            title: 'Event Details',
            event,
            registrationCount,
            isRegistered,
            isFull
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Show create event form
exports.showCreateEvent = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        res.render('events/create', {
            title: 'Create Event',
            categories,
            error: null
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Create event
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, capacity } = req.body;

        await Event.create({
            title,
            description,
            date,
            location,
            category,
            capacity
        });

        res.redirect('/events');
    } catch (error) {
        const categories = await Category.find().sort({ name: 1 });

        res.render('events/create', {
            title: 'Create Event',
            categories,
            error: error.message
        });
    }
};

// Show edit event form
exports.showEditEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const categories = await Category.find().sort({ name: 1 });

        if (!event) {
            return res.status(404).send('Event not found');
        }

        res.render('events/edit', {
            title: 'Edit Event',
            event,
            categories,
            error: null
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Update event
exports.updateEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, capacity } = req.body;

        await Event.findByIdAndUpdate(
            req.params.id,
            { title, description, date, location, category, capacity },
            { new: true, runValidators: true }
        );

        res.redirect('/events');
    } catch (error) {
        const event = await Event.findById(req.params.id);
        const categories = await Category.find().sort({ name: 1 });

        res.render('events/edit', {
            title: 'Edit Event',
            event,
            categories,
            error: error.message
        });
    }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    try {
        await Registration.deleteMany({ event: req.params.id });
        await Event.findByIdAndDelete(req.params.id);

        res.redirect('/events');
    } catch (error) {
        res.status(500).send(error.message);
    }
};