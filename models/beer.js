const mongoose = require("mongoose");


const locationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: false
        },
        locationImage: {
            data: Buffer,
            contentType: String,
        },
        beerPrice: {
            type: Number,
            required: false,
            min: 0,
        },
        beerRating: {
            type: Number,
            enum: [1, 2, 3, 4, 5],
            required: false,
        },
        notes: String,
        beerCount: {
            type: Number,
            required: false,
            min: 0,
        }
    },
    { timestamps: true }
);


const beerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        image: {
            data: Buffer,
            contentType: String,
        },
        category: {
            type: String,
            required: true,
            enum: ['Ale', 'Lager'],
        },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        location: [locationSchema],
        time: {
            type: Date,
        }
    },
    { timestamps: true }
);


const Beer = mongoose.model('Beer', beerSchema);

module.exports = Beer;

