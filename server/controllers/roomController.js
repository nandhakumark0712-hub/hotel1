const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// @desc    Get rooms by hotel
// @route   GET /api/rooms/:hotelId
// @access  Public
exports.getRoomsByHotel = async (req, res) => {
    try {
        const rooms = await Room.find({ hotelId: req.params.hotelId });
        res.json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Manager/Admin)
exports.createRoom = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.body.hotelId);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        if (hotel.managerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const room = await Room.create(req.body);
        res.status(201).json({ success: true, data: room });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Manager/Admin)
exports.updateRoom = async (req, res) => {
    try {
        let room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        const hotel = await Hotel.findById(room.hotelId);
        if (hotel.managerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Manager/Admin)
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        const hotel = await Hotel.findById(room.hotelId);
        if (hotel.managerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await room.remove();
        res.json({ success: true, message: 'Room removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
