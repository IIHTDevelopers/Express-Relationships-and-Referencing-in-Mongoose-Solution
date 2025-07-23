const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// POST: Create a new hotel
router.post('/hotels', hotelController.createHotel);

// GET: Retrieve all hotels
router.get('/hotels', hotelController.getAllHotels);

// GET: Retrieve a single hotel with its reviews
router.get('/hotels/:hotelId', hotelController.getHotelById);

// POST: Add a review to a hotel
router.post('/hotels/:hotelId/reviews', hotelController.createReview);

// GET: Retrieve all reviews for a specific hotel
router.get('/hotels/:hotelId/reviews', hotelController.getHotelReviews);

// POST: Create a room type
router.post('/room-types', hotelController.createRoomType);

// POST: Link room type to hotel (many-to-many relationship)
router.post('/hotels/:hotelId/room-types/:roomTypeId', hotelController.linkRoomTypeToHotel);

// GET: Retrieve room types for a hotel
router.get('/hotels/:hotelId/room-types', hotelController.getRoomTypesForHotel);

// DELETE: Delete a hotel
router.delete('/hotels/:hotelId', hotelController.deleteHotel);

// DELETE: Delete a review for a hotel
router.delete('/hotels/:hotelId/reviews/:reviewId', hotelController.deleteReview);

module.exports = router;
