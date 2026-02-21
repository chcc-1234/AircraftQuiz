const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const basePath = path.join(__dirname, '../public/images');

// In-memory sessions
const sessions = {};

// Build aircraft list from folders
function getAllAircraft() {
    const aircraftList = [];
    const categories = fs.readdirSync(basePath);

    for (const category of categories) {
        const categoryPath = path.join(basePath, category);
        if (!fs.lstatSync(categoryPath).isDirectory()) continue;

        const families = fs.readdirSync(categoryPath);

        for (const family of families) {
            const familyPath = path.join(categoryPath, family);
            if (!fs.lstatSync(familyPath).isDirectory()) continue;

            const variants = fs.readdirSync(familyPath);

            for (const variant of variants) {
                const variantPath = path.join(familyPath, variant);
                if (!fs.lstatSync(variantPath).isDirectory()) continue;

                const imageFiles = fs.readdirSync(variantPath);
                if (imageFiles.length === 0) continue;

                const images = imageFiles.map(file =>
                    `/images/${category}/${family}/${variant}/${file}`
                );

                aircraftList.push({
                    id: crypto.randomUUID(),
                    category,
                    family,
                    natoName: variant,
                    images
                });
            }
        }
    }

    return aircraftList;
}

// ==============================
// START QUIZ
// ==============================
router.post('/start', (req, res) => {
    const { mode } = req.body;

    if (!mode) {
        return res.status(400).json({ message: "Mode is required" });
    }

    const allAircraft = getAllAircraft();

    const filtered =
        mode === "Random"
            ? allAircraft
            : allAircraft.filter(a => a.category === mode);

    if (filtered.length < 4) {
        return res.status(400).json({
            message: "Not enough aircraft in this category to start quiz"
        });
    }

    const sessionId = crypto.randomUUID();

    sessions[sessionId] = {
        mode,
        score: 0,
        answered: 0,
        totalQuestions: Math.min(20, filtered.length),
        usedAircraft: [],
        aircraftPool: filtered
    };

    res.json({
        sessionId,
        totalQuestions: sessions[sessionId].totalQuestions
    });
});

// ==============================
// GET QUESTION
// ==============================
router.get('/question/:sessionId', (req, res) => {
    const session = sessions[req.params.sessionId];

    if (!session || session.completed) {
        return res.status(400).json({ message: "Invalid session" });
    }

    if (session.answered >= session.totalQuestions) {
        session.completed = true;

        return res.json({
            completed: true,
            score: session.score,
            totalQuestions: session.totalQuestions
        });
    }

    const available = session.aircraftPool.filter(
        a => !session.usedAircraft.includes(a.id)
    );

    const correct =
        available[Math.floor(Math.random() * available.length)];

    const distractors = session.aircraftPool
        .filter(a => a.id !== correct.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    const options = [
        correct.natoName,
        ...distractors.map(d => d.natoName)
    ].sort(() => 0.5 - Math.random());

    session.currentAircraft = correct;
    session.usedAircraft.push(correct.id);

    res.json({
        aircraftId: correct.id,
        images: correct.images,
        options,
        answered: session.answered,
        totalQuestions: session.totalQuestions
    });
});

// ==============================
// SUBMIT ANSWER
// ==============================
router.post('/answer', (req, res) => {
    const { sessionId, selectedAnswer } = req.body;

    const session = sessions[sessionId];

    if (!session || session.completed) {
        return res.status(400).json({ message: "Invalid session" });
    }

    const correctAnswer = session.currentAircraft.natoName;
    const isCorrect = correctAnswer === selectedAnswer;

    if (isCorrect) session.score++;

    session.answered++;

    if (session.answered >= session.totalQuestions) {
        session.completed = true;
    }

    res.json({
        correct: isCorrect,
        correctAnswer,
        score: session.score,
        answered: session.answered,
        totalQuestions: session.totalQuestions,
        completed: session.completed
    });
});

module.exports = router;