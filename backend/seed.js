require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Event = require('./src/models/Event');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Create admin user
    const adminExists = await User.findOne({ email: 'premvellogi@gmail.com' });
    if (!adminExists) {
        await User.create({
            name: 'Prem Vellogi',
            email: 'premvellogi@gmail.com',
            password: 'PremVellogi@17',
            role: 'admin',
        });
        console.log('✅ Admin user created: premvellogi@gmail.com');
    } else {
        console.log('ℹ️  Admin user already exists');
    }

    // Create sample events
    const admin = await User.findOne({ role: 'admin' });
    const eventsCount = await Event.countDocuments();

    if (eventsCount === 0 && admin) {
        await Event.insertMany([
            {
                title: 'National Hackathon 2026',
                description: 'A 36-hour coding marathon where students solve real-world problems using cutting-edge technologies. Open to all departments. Prizes worth ₹2,00,000!',
                department: 'Computer Science',
                eventType: 'Hackathon',
                date: new Date('2026-03-25T09:00:00'),
                endDate: new Date('2026-03-26T21:00:00'),
                venue: 'Main Auditorium & CS Labs',
                registrationLink: 'https://forms.university.edu/hackathon2026',
                status: 'upcoming',
                featured: true,
                tags: ['coding', 'innovation', 'prize'],
                createdBy: admin._id,
            },
            {
                title: 'AI & Machine Learning Workshop',
                description: 'A hands-on workshop covering neural networks, deep learning, and practical AI applications using Python and TensorFlow. Guest speakers from top tech companies.',
                department: 'Computer Science',
                eventType: 'Workshop',
                date: new Date('2026-03-18T10:00:00'),
                endDate: new Date('2026-03-18T17:00:00'),
                venue: 'Seminar Hall B',
                status: 'upcoming',
                featured: true,
                tags: ['AI', 'machine learning', 'python'],
                createdBy: admin._id,
            },
            {
                title: 'Annual Cultural Fest - Euphoria 2026',
                description: 'The biggest cultural extravaganza of the year! Dance, music, drama, art exhibitions, food stalls, and celebrity performances. Three days of non-stop entertainment.',
                department: 'Cultural Clubs',
                eventType: 'Fest',
                date: new Date('2026-04-10T09:00:00'),
                endDate: new Date('2026-04-12T22:00:00'),
                venue: 'University Grounds',
                status: 'upcoming',
                featured: true,
                tags: ['culture', 'music', 'dance', 'entertainment'],
                createdBy: admin._id,
            },
            {
                title: 'VLSI Design Seminar',
                description: 'Industry experts discuss the latest advancements in VLSI design, chip fabrication, and embedded systems. Networking opportunity with Electronics graduates.',
                department: 'Electronics',
                eventType: 'Seminar',
                date: new Date('2026-03-14T14:00:00'),
                venue: 'ECE Conference Room',
                status: 'upcoming',
                featured: false,
                tags: ['VLSI', 'semiconductor', 'embedded'],
                createdBy: admin._id,
            },
            {
                title: 'Inter-Department Sports Meet',
                description: 'Annual sports competition featuring cricket, football, volleyball, badminton, and athletics. All departments compete for the championship trophy.',
                department: 'Cultural Clubs',
                eventType: 'Sports',
                date: new Date('2026-03-20T08:00:00'),
                endDate: new Date('2026-03-22T18:00:00'),
                venue: 'University Sports Complex',
                status: 'upcoming',
                featured: false,
                tags: ['sports', 'fitness', 'competition'],
                createdBy: admin._id,
            },
            {
                title: 'Entrepreneurship Summit 2025',
                description: 'Inspiring talks from successful alumni entrepreneurs, pitch competition, venture capital panel, and startup exhibition. Seed funding opportunities available.',
                department: 'Management',
                eventType: 'Seminar',
                date: new Date('2025-12-15T09:00:00'),
                venue: 'Business School Auditorium',
                status: 'completed',
                featured: false,
                tags: ['startup', 'entrepreneurship', 'investment'],
                createdBy: admin._id,
            },
        ]);
        console.log('✅ Sample events created');
    } else {
        console.log('ℹ️  Events already exist, skipping seed');
    }

    await mongoose.disconnect();
    console.log('✅ Seeding complete!');
};

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
