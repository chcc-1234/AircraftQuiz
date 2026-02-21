const express = require('express');
const router = express.Router();
const QuizSession = require('../models/QuizSession');

router.get('/', async (req, res) => {
    const top = await QuizSession.find({ completed: true })
        .populate("user", "username")
        .sort({ score: -1 })
        .limit(10);

    res.json(top);
});

module.exports = router;
