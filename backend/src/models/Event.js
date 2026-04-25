const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            enum: [
                'Computer Science',
                'Electronics',
                'Mechanical',
                'Civil',
                'Cultural Clubs',
                'Management',
                'Science',
                'Other',
            ],
        },
        eventType: {
            type: String,
            required: true,
            enum: [
                'Workshop',
                'Seminar',
                'Hackathon',
                'Fest',
                'Sports',
                'Academic',
                'Cultural',
                'Other',
            ],
        },
        date: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        endDate: {
            type: Date,
        },
        venue: {
            type: String,
            required: [true, 'Venue is required'],
        },
        poster: {
            type: String,
            default: '',
        },
        posterPublicId: {
            type: String,
            default: '',
        },
        registrationLink: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['upcoming', 'completed'],
            default: 'upcoming',
        },
        featured: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tags: [String],
    },
    { timestamps: true }
);

// Text index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Event', eventSchema);
