const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true
        },

        description: {
            type: String,
            required: [true, 'Event description is required'],
            trim: true
        },

        date: {
            type: Date,
            required: [true, 'Event date is required']
        },

        location: {
            type: String,
            required: [true, 'Event location is required'],
            trim: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Event category is required']
        },

        capacity: {
            type: Number,
            required: [true, 'Event capacity is required'],
            min: [1, 'Capacity must be at least 1']
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Event', eventSchema);