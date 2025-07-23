const mongoose = require('mongoose');

// Hotel Schema definition
const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    rooms: {
        type: Number,
        required: true,
        min: 1
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    roomTypes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomType'
    }]
}, { timestamps: true });

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
