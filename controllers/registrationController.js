const Registration = require('../models/Registration');
const Event = require('../models/Event');

// Admin: view all registrations
exports.getAllRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find()
            .populate('user')
            .populate({
                path: 'event',
                populate: { path: 'category' }
            })
            .sort({ createdAt: -1 });

        res.render('registrations/index', {
            title: 'All Registrations',
            registrations,
            error: null
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// User: view own registrations
exports.getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user._id })
            .populate({
                path: 'event',
                populate: { path: 'category' }
            })
            .sort({ createdAt: -1 });

        res.render('registrations/my', {
            title: 'My Registrations',
            registrations,
            error: null
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// User: register for event
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const existingRegistration = await Registration.findOne({
            user: req.user._id,
            event: event._id
        });

        if (existingRegistration) {
            return res.redirect(`/events/${event._id}`);
        }

        const registrationCount = await Registration.countDocuments({
            event: event._id
        });

        if (registrationCount >= event.capacity) {
            return res.status(400).send('This event is full');
        }

        await Registration.create({
            user: req.user._id,
            event: event._id
        });

        res.redirect('/registrations/my');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// User: cancel own registration
exports.cancelRegistration = async (req, res) => {
    try {
        await Registration.findOneAndDelete({
            user: req.user._id,
            event: req.params.eventId
        });

        res.redirect('/registrations/my');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Admin: delete any registration
exports.deleteRegistration = async (req, res) => {
    try {
        await Registration.findByIdAndDelete(req.params.id);
        res.redirect('/registrations');
    } catch (error) {
        res.status(500).send(error.message);
    }
};