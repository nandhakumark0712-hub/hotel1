const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    roomType: {
        type: String,
        required: [true, 'Room type is required'],
        enum: ['Single', 'Double', 'Deluxe', 'Family', 'Suite', 'Penthouse']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required']
    },
    amenities: [String],
    images: [String],
    availability: {
        type: Boolean,
        default: true
    },
    totalRooms: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
