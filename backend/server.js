require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const eventRoutes = require('./src/routes/event.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const adminRoutes = require('./src/routes/admin.routes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
