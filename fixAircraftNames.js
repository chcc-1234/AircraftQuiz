require('dotenv').config();
const mongoose = require('mongoose');
const Aircraft = require('./models/Aircraft');

async function fixNames() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const aircraftList = await Aircraft.find();

    for (let aircraft of aircraftList) {
        const cleanedName = aircraft.name.replace(/_\d+$/, "");

        if (cleanedName !== aircraft.name) {
            console.log(`Fixing: ${aircraft.name} → ${cleanedName}`);
            aircraft.name = cleanedName;
            await aircraft.save();
        }
    }

    console.log("Done fixing names");
    process.exit();
}

fixNames();
