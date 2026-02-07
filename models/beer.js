const mongoose = require("mongoose");


const locationSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            required: true
        },
        locationImage: {
            data: Buffer,
            contentType: String,
        },
        BeerPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        beerRating: {
            type: Number,
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            required: true,
        },
        comment: String,
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

