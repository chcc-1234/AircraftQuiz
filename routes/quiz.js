const express = require('express');
const router = express.Router();
const Aircraft = require('../models/Aircraft');
const QuizSession = require('../models/QuizSession');


// ==============================
// START QUIZ
// ==============================
router.post('/start', async (req, res) => {
    try {
        const { mode } = req.body;

        if (!mode) {
            return res.status(400).json({ message: "Mode is required" });
        }

        let filter = {};

        if (mode !== "Random") {
            filter.category = mode;
        }

        const availableCount = await Aircraft.countDocuments(filter);

        if (availableCount < 4) {
            return res.status(400).json({
                message: "Not enough aircraft in this category to start quiz"
            });
        }

        const questionLimit = Math.min(20, availableCount);

        const session = new QuizSession({
            mode,
            score: 0,
            totalQuestions: questionLimit,
            answered: 0,
            completed: false,
            usedAircraft: []
        });

        await session.save();

        res.json({
            message: "Quiz session started",
            sessionId: session._id,
            totalQuestions: questionLimit
        });

    } catch (error) {
        console.error("START QUIZ ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// ==============================
// GET QUESTION
// ==============================
router.get('/question/:sessionId', async (req, res) => {
    try {
        const session = await QuizSession.findById(req.params.sessionId);

        if (!session || session.completed) {
            return res.status(400).json({ message: "Invalid session" });
        }

        if (session.answered >= session.totalQuestions) {
            session.completed = true;
            await session.save();

            return res.json({
                completed: true,
                score: session.score,
                totalQuestions: session.totalQuestions
            });
        }

        let correctFilter = {
            _id: { $nin: session.usedAircraft }
        };

        if (session.mode !== "Random") {
            correctFilter.category = session.mode;
        }

        const availableCorrect = await Aircraft.find(correctFilter);

        if (availableCorrect.length === 0) {
            session.completed = true;
            await session.save();

            return res.json({
                completed: true,
                score: session.score,
                totalQuestions: session.totalQuestions
            });
        }

        const correctAircraft =
            availableCorrect[Math.floor(Math.random() * availableCorrect.length)];

        let distractorPool = await Aircraft.find({
            category: correctAircraft.category,
            family: correctAircraft.family,
            _id: { $ne: correctAircraft._id }
        });

        if (distractorPool.length < 3) {
            distractorPool = await Aircraft.find({
                category: correctAircraft.category,
                _id: { $ne: correctAircraft._id }
            });
        }

        if (distractorPool.length < 3) {
            session.completed = true;
            await session.save();

            return res.json({
                completed: true,
                score: session.score,
                totalQuestions: session.totalQuestions
            });
        }

        const shuffled = distractorPool.sort(() => 0.5 - Math.random());
        const wrongAnswers = shuffled.slice(0, 3);

        const options = [
            correctAircraft.natoName,
            ...wrongAnswers.map(a => a.natoName)
        ].sort(() => 0.5 - Math.random());

        session.usedAircraft.push(correctAircraft._id);
        await session.save();

        res.json({
            aircraftId: correctAircraft._id,
            images: correctAircraft.images,
            options,
            answered: session.answered,
            totalQuestions: session.totalQuestions
        });

    } catch (error) {
        console.error("GET QUESTION ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// ==============================
// SUBMIT ANSWER
// ==============================
router.post('/answer', async (req, res) => {
    try {
        const { sessionId, aircraftId, selectedAnswer } = req.body;

        const session = await QuizSession.findById(sessionId);

        if (!session || session.completed) {
            return res.status(400).json({ message: "Invalid session" });
        }

        const aircraft = await Aircraft.findById(aircraftId);

        if (!aircraft) {
            return res.status(400).json({ message: "Aircraft not found" });
        }

        const isCorrect = aircraft.natoName === selectedAnswer;

        if (isCorrect) {
            session.score++;
        }

        session.answered++;

        if (session.answered >= session.totalQuestions) {
            session.completed = true;
        }

        await session.save();

        res.json({
            correct: isCorrect,
            correctAnswer: aircraft.natoName,
            score: session.score,
            answered: session.answered,
            totalQuestions: session.totalQuestions,
            completed: session.completed
        });

    } catch (error) {
        console.error("SUBMIT ANSWER ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;