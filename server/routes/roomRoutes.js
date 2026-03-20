const express = require('express');
const router = express.Router();
const { getRoomsByHotel, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:hotelId', getRoomsByHotel);
router.post('/', protect, authorize('manager', 'admin'), createRoom);
router.put('/:id', protect, authorize('manager', 'admin'), updateRoom);
router.delete('/:id', protect, authorize('manager', 'admin'), deleteRoom);

module.exports = router;
