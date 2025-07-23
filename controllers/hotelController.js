const Hotel = require('../models/hotel');
const Review = require('../models/review');
const RoomType = require('../models/roomType');

// Create a new hotel
const createHotel = async (req, res) => {
    try {
        const { name, location, price, rooms } = req.body;
        const hotel = new Hotel({ name, location, price, rooms });
        await hotel.save();
        res.status(201).json({ message: 'Hotel successfully added!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all hotels with populated reviews
const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().populate('reviews');
        res.status(200).json(hotels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single hotel with its reviews
const getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId).populate('reviews');
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.status(200).json(hotel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a review for a hotel
const createReview = async (req, res) => {
    try {
        const { author, comment, rating } = req.body;
        const hotel = await Hotel.findById(req.params.hotelId);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        const review = new Review({ author, comment, rating, hotel: hotel._id });
        await review.save();

        hotel.reviews.push(review._id);
        await hotel.save();

        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all reviews for a hotel
const getHotelReviews = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId).populate('reviews');
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.status(200).json(hotel.reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a room type
const createRoomType = async (req, res) => {
    try {
        const { type, description, price } = req.body;
        const roomType = new RoomType({ type, description, price });
        await roomType.save();
        res.status(201).json(roomType);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Link room type to a hotel
const linkRoomTypeToHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId);
        const roomType = await RoomType.findById(req.params.roomTypeId);

        if (!hotel || !roomType) {
            return res.status(404).json({ message: 'Hotel or Room Type not found' });
        }

        // Add the room type's ID to the hotel's roomTypes array
        hotel.roomTypes.push(roomType._id);

        // Save the updated hotel document
        await hotel.save();

        res.status(200).json({ message: 'Room type linked to hotel successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all room types for a hotel
const getRoomTypesForHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId).populate('roomTypes');
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.status(200).json(hotel.roomTypes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a hotel
const deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.hotelId);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.status(200).json({ message: 'Hotel deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a review for a hotel
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        const hotel = await Hotel.findById(req.params.hotelId);
        hotel.reviews.pull(review._id);
        await hotel.save();

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createHotel,
    getAllHotels,
    getHotelById,
    createReview,
    getHotelReviews,
    createRoomType,
    linkRoomTypeToHotel,
    getRoomTypesForHotel,
    deleteHotel,
    deleteReview
};
