const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Show register page
exports.showRegister = (req, res) => {
    res.render('register', {
        title: 'Register',
        error: null
    });
};

// Show login page
exports.showLogin = (req, res) => {
    res.render('login', {
        title: 'Login',
        error: null
    });
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, adminCode } = req.body;

        if (!name || !email || !password) {
            return res.render('register', {
                title: 'Register',
                error: 'Please fill in all required fields'
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.render('register', {
                title: 'Register',
                error: 'Email is already registered'
            });
        }

        let finalRole = 'user';

        if (role === 'admin') {
            if (adminCode === process.env.ADMIN_CODE) {
                finalRole = 'admin';
            } else {
                return res.render('register', {
                    title: 'Register',
                    error: 'Invalid admin code'
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: finalRole
        });

        res.redirect('/login');
    } catch (error) {
        res.render('register', {
            title: 'Register',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', {
                title: 'Login',
                error: 'Please enter email and password'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.render('login', {
                title: 'Login',
                error: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', {
                title: 'Login',
                error: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.redirect('/');
    } catch (error) {
        res.render('login', {
            title: 'Login',
            error: error.message
        });
    }
};

// Logout user
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};