const mongoose = require('mongoose');

// RoomType Schema definition
const roomTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const RoomType = mongoose.model('RoomType', roomTypeSchema);

module.exports = RoomType;
