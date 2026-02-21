const express = require('express');
const cors = require('cors');
const path = require('path');

const quizRoutes = require('./routes/quiz');

const app = express();

app.use(cors());
app.use(express.json());

// Serve images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/quiz', quizRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});