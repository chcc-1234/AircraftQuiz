require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Aircraft = require('./models/Aircraft');

async function importAircraft() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const imagesPath = path.join(__dirname, 'public/images/baltica');
        const files = fs.readdirSync(imagesPath);

        const aircraftMap = {};

        files.forEach(file => {
            // Remove extension
            const nameWithoutExt = file.replace(/\.[^/.]+$/, "");

            // Remove _number at end
            const aircraftName = nameWithoutExt.replace(/_\d+$/, "");

            if (!aircraftMap[aircraftName]) {
                aircraftMap[aircraftName] = [];
            }

            aircraftMap[aircraftName].push(`baltica/${file}`);
        });

        for (let name in aircraftMap) {
            const existing = await Aircraft.findOne({ name });

            if (!existing) {
                await Aircraft.create({
                    name,
                    category: "baltica",
                    images: aircraftMap[name]
                });
                console.log("Inserted:", name);
            } else {
                console.log("Already exists:", name);
            }
        }

        console.log("Import complete");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

importAircraft();
