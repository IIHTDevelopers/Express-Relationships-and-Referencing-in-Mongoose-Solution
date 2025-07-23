const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Hotel = require('../../models/hotel');
const Review = require('../../models/review');
const RoomType = require('../../models/roomType');

let mongoServer;

// Start a MongoDB in-memory server before tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Close the in-memory MongoDB server after tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

let hotelBoundaryTest = `HotelModel boundary test`;

describe('Hotel Model', () => {
    describe('boundary', () => {

        // Create review and roomType to associate with hotel in the tests
        let review, roomType;

        beforeEach(async () => {
            // Create a review and roomType to use in the hotel
            review = new Review({
                author: 'John Doe',
                comment: 'Great hotel!',
                rating: 5,
                hotel: mongoose.Types.ObjectId()
            });
            await review.save();

            roomType = new RoomType({
                type: 'Suite',
                description: 'A luxurious suite.',
                price: 250
            });
            await roomType.save();
        });

        afterEach(async () => {
            // Clean up after each test
            await Hotel.deleteMany();
            await Review.deleteMany();
            await RoomType.deleteMany();
        });

        // Test case 1: Create a valid hotel
        test(`${hotelBoundaryTest} should create a hotel with valid data`, async () => {
            const hotelData = {
                name: 'Hotel California',
                location: 'California',
                price: 200,
                rooms: 100,
                reviews: [review._id],
                roomTypes: [roomType._id]
            };

            const hotel = new Hotel(hotelData);
            await hotel.save();

            // Assertions
            expect(hotel).toHaveProperty('_id');
            expect(hotel.name).toBe('Hotel California');
            expect(hotel.location).toBe('California');
            expect(hotel.price).toBe(200);
            expect(hotel.rooms).toBe(100);
            expect(hotel.reviews).toHaveLength(1);
            expect(hotel.roomTypes).toHaveLength(1);
        });

        // Test case 2: Creating a hotel with missing required fields
        test(`${hotelBoundaryTest} should throw an error if required fields are missing`, async () => {
            const invalidHotel = new Hotel({
                name: 'Hotel California', // location and price are missing
            });

            let error;
            try {
                await invalidHotel.save();
            } catch (err) {
                error = err;
            }

            // Assertions: Ensure validation error occurs for missing required fields
            expect(error).toBeDefined();
            expect(error.errors.location).toBeDefined();
            expect(error.errors.price).toBeDefined();
        });

        // Test case 3: Ensure that hotel price is not negative
        test(`${hotelBoundaryTest} should throw an error if price is less than 0`, async () => {
            const invalidHotel = new Hotel({
                name: 'Hotel California',
                location: 'California',
                price: -200, // Invalid price
                rooms: 100
            });

            let error;
            try {
                await invalidHotel.save();
            } catch (err) {
                error = err;
            }

            // Assertions: Ensure validation error occurs for invalid price
            expect(error).toBeDefined();
            expect(error.errors.price).toBeDefined();
        });

        // Test case 4: Ensure hotel references to reviews and room types are handled correctly
        test(`${hotelBoundaryTest} should associate reviews and room types with a hotel`, async () => {
            const hotelData = {
                name: 'Hotel California',
                location: 'California',
                price: 200,
                rooms: 100,
                reviews: [review._id], // Linking review by its ID
                roomTypes: [roomType._id] // Linking room type by its ID
            };

            const hotel = new Hotel(hotelData);
            await hotel.save();

            // Assertions: Ensure review and room type are correctly linked
            expect(hotel.reviews[0].toString()).toBe(review._id.toString());
            expect(hotel.roomTypes[0].toString()).toBe(roomType._id.toString());
        });

        // Test case 5: Check for createdAt and updatedAt fields
        test(`${hotelBoundaryTest} should have createdAt and updatedAt timestamps`, async () => {
            const hotelData = {
                name: 'Hotel California',
                location: 'California',
                price: 200,
                rooms: 100
            };

            const hotel = new Hotel(hotelData);
            await hotel.save();

            // Assertions: Ensure timestamps are automatically set
            expect(hotel.createdAt).toBeDefined();
            expect(hotel.updatedAt).toBeDefined();
        });
    });
});

