const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

const { protect } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect database
connectDB();

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Global current user middleware
app.use(async (req, res, next) => {
    res.locals.currentUser = null;

    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            res.locals.currentUser = user;
        } catch (error) {
            res.locals.currentUser = null;
        }
    }

    next();
});

// Routes
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/events', eventRoutes);
app.use('/registrations', registrationRoutes);

// Protected dashboard
app.get('/', protect, (req, res) => {
    res.render('index', {
        title: 'Dashboard',
        message: 'Welcome to your Event Management System Dashboard'
    });
});

// 404 page
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});