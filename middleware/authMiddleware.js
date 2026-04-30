const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes: only logged-in users can access
exports.protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            res.clearCookie('token');
            return res.redirect('/login');
        }

        req.user = user;
        res.locals.currentUser = user;

        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// Admin-only routes
exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Access denied: Admins only');
    }

    next();
};

// User-only routes, optional but useful
exports.isUser = (req, res, next) => {
    if (!req.user || req.user.role !== 'user') {
        return res.status(403).send('Access denied: Users only');
    }

    next();
};