const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mode: {
        type: String, // Civilian, Military, UAS, Random
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 20
    },
    answered: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    usedAircraft: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Aircraft'
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('QuizSession', quizSessionSchema);
