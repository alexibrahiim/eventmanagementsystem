const Category = require('../models/Category');
const Event = require('../models/Event');

// Show all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.render('categories/index', {
            title: 'Categories',
            categories,
            error: null
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Show create category form
exports.showCreateCategory = (req, res) => {
    res.render('categories/create', {
        title: 'Create Category',
        error: null
    });
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        await Category.create({
            name,
            description
        });

        res.redirect('/categories');
    } catch (error) {
        res.render('categories/create', {
            title: 'Create Category',
            error: error.message
        });
    }
};

// Show edit category form
exports.showEditCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.render('categories/edit', {
            title: 'Edit Category',
            category,
            error: null
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );

        res.redirect('/categories');
    } catch (error) {
        const category = await Category.findById(req.params.id);

        res.render('categories/edit', {
            title: 'Edit Category',
            category,
            error: error.message
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const eventsUsingCategory = await Event.countDocuments({
            category: req.params.id
        });

        if (eventsUsingCategory > 0) {
            const categories = await Category.find().sort({ createdAt: -1 });

            return res.render('categories/index', {
                title: 'Categories',
                categories,
                error: 'Cannot delete this category because it is used by one or more events.'
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.redirect('/categories');
    } catch (error) {
        res.status(500).send(error.message);
    }
};