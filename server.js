// ======================
// Load Environment Variables
// ======================
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());

// Serve images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Serve entire public folder (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// Routes
// ======================

// ❌ REMOVED AUTH ROUTES
// const authRoutes = require('./routes/auth');

const aircraftRoutes = require('./routes/aircraft');
const quizRoutes = require('./routes/quiz');
const leaderboardRoutes = require('./routes/leaderboard');

// ❌ REMOVED AUTH ROUTE USE
// app.use('/api/auth', authRoutes);

app.use('/api/aircraft', aircraftRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======================
// Database Connection
// ======================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB Connection Error:', error);
    });