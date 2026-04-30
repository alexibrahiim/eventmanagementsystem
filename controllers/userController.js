const bcrypt = require('bcrypt');
const User = require('../models/User');
const Registration = require('../models/Registration');

// Admin: view all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const normalUserCount = await User.countDocuments({ role: 'user' });

        res.render('users/index', {
            title: 'Users',
            users,
            totalUsers,
            adminCount,
            normalUserCount
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Admin: show create user form
exports.showCreateUser = (req, res) => {
    res.render('users/create', {
        title: 'Create User',
        error: null
    });
};

// Admin: create user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.render('users/create', {
                title: 'Create User',
                error: 'Please fill in all required fields'
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.render('users/create', {
                title: 'Create User',
                error: 'This email is already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.redirect('/users');
    } catch (error) {
        res.render('users/create', {
            title: 'Create User',
            error: error.message
        });
    }
};

// Admin: view one user details
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).send('User not found');
        }

        const registrations = await Registration.find({ user: user._id })
            .populate('event')
            .sort({ createdAt: -1 });

        res.render('users/details', {
            title: 'User Details',
            user,
            registrations
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Admin: show edit user form
exports.showEditUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('users/edit', {
            title: 'Edit User',
            user,
            error: null
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Admin: update user
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (!name || !email || !role) {
            return res.render('users/edit', {
                title: 'Edit User',
                user,
                error: 'Name, email, and role are required'
            });
        }

        const existingUser = await User.findOne({
            email,
            _id: { $ne: user._id }
        });

        if (existingUser) {
            return res.render('users/edit', {
                title: 'Edit User',
                user,
                error: 'This email is already used by another account'
            });
        }

        user.name = name;
        user.email = email;
        user.role = role;

        if (password && password.trim() !== '') {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.redirect('/users');
    } catch (error) {
        try {
            const user = await User.findById(req.params.id).select('-password');

            res.render('users/edit', {
                title: 'Edit User',
                user,
                error: error.message
            });
        } catch {
            res.status(500).send(error.message);
        }
    }
};

// Admin: delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        if (req.user && req.user._id.toString() === userId) {
            return res.status(400).send('You cannot delete your own admin account while logged in.');
        }

        await Registration.deleteMany({ user: userId });
        await User.findByIdAndDelete(userId);

        res.redirect('/users');
    } catch (error) {
        res.status(500).send(error.message);
    }
};