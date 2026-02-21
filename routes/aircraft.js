const express = require('express');
const router = express.Router();
const Aircraft = require('../models/Aircraft');
const authMiddleware = require('../middleware/authMiddleware');

/* ======================
   ADD AIRCRAFT (Protected)
====================== */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, category, images } = req.body;

        if (!name || !category || !images) {
            return res.status(400).json({
                message: "Name, category, and images are required"
            });
        }

        const newAircraft = new Aircraft({
            name,
            category,
            images
        });

        await newAircraft.save();

        res.status(201).json({
            message: "Aircraft added successfully",
            aircraft: newAircraft
        });

    } catch (error) {
        console.error("ADD AIRCRAFT ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


/* ======================
   GET ALL AIRCRAFT (Optional / Debug)
====================== */
router.get('/', async (req, res) => {
    try {
        const aircraft = await Aircraft.find();
        res.json(aircraft);
    } catch (error) {
        console.error("GET AIRCRAFT ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


/* ======================
   GET AVAILABLE CATEGORIES
====================== */
router.get('/categories', async (req, res) => {
    try {
        const categories = await Aircraft.distinct("category");

        res.json({
            categories
        });

    } catch (error) {
        console.error("GET CATEGORIES ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
