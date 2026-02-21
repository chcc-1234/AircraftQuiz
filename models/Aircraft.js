const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            trim: true
        },
        family: {
            type: String,
            required: true,
            trim: true
        },
        natoName: {
            type: String,
            required: true,
            trim: true
        },
        images: [
            {
                type: String,
                required: true
            }
        ]
    },
    { timestamps: true }
);

aircraftSchema.index(
    { category: 1, family: 1, natoName: 1 },
    { unique: true }
);

module.exports = mongoose.model('Aircraft', aircraftSchema);
