require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Aircraft = require('../models/Aircraft');

async function importAircraft() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        await Aircraft.deleteMany({});
        console.log("🗑 Old Aircraft collection cleared");

        const basePath = path.join(__dirname, '../public/images');

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

                    const imagePaths = imageFiles.map(file =>
                        `/images/${category}/${family}/${variant}/${file}`
                    );

                    await Aircraft.create({
                        category,
                        family,
                        natoName: variant,
                        images: imagePaths
                    });

                    console.log(`Inserted ${category} - ${family} - ${variant}`);
                }
            }
        }

        console.log("🎯 Import complete");
        process.exit();

    } catch (error) {
        console.error("❌ Import Error:", error);
        process.exit(1);
    }
}

importAircraft();
