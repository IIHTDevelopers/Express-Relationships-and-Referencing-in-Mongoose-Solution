const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Review = require('../../models/review');
const Hotel = require('../../models/hotel');

let mongoServer;

// Start a MongoDB in-memory server
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

let reviewBoundaryTest = `ReviewModel boundary test`;

describe('Review Model', () => {
    describe('boundary', () => {

        // Create a hotel for reference in the review
        let hotel;

        beforeEach(async () => {
            // Create a hotel document for testing review associations
            hotel = new Hotel({
                name: 'Test Hotel',
                location: 'California',
                price: 150,
                rooms: 100,
            });
            await hotel.save();
        });

        afterEach(async () => {
            // Clean up all reviews and hotels after each test
            await Review.deleteMany();
            await Hotel.deleteMany();
        });

        // Test case 1: Creating a valid review
        test(`${reviewBoundaryTest} should create a review with valid data`, async () => {
            const reviewData = {
                author: 'John Doe',
                comment: 'Great place to stay!',
                rating: 5,
                hotel: hotel._id, // Linking review to hotel
            };

            const review = new Review(reviewData);
            await review.save();

            // Assertions
            expect(review).toHaveProperty('_id');
            expect(review.author).toBe('John Doe');
            expect(review.comment).toBe('Great place to stay!');
            expect(review.rating).toBe(5);
            expect(review.hotel.toString()).toBe(hotel._id.toString());
        });

        // Test case 2: Creating a review with missing required fields
        test(`${reviewBoundaryTest} should throw an error if required fields are missing`, async () => {
            const invalidReviewData = {
                comment: 'Good hotel, but expensive',
                rating: 4,
            };

            const review = new Review(invalidReviewData);

            let error;
            try {
                await review.save();
            } catch (err) {
                error = err;
            }

            // Assertions: Ensure validation error occurs for missing required fields
            expect(error).toBeDefined();
            expect(error.errors.author).toBeDefined(); // The author is required but missing
            expect(error.errors.hotel).toBeDefined(); // The hotel field is also required but missing
        });

        // Test case 3: Ensuring rating is within the valid range
        test(`${reviewBoundaryTest} should throw an error if rating is outside the range of 1 to 5`, async () => {
            const invalidRatingReview = new Review({
                author: 'Jane Doe',
                comment: 'Not so good.',
                rating: 10, // Invalid rating (should be between 1 and 5)
                hotel: hotel._id,
            });

            let error;
            try {
                await invalidRatingReview.save();
            } catch (err) {
                error = err;
            }

            // Assertions: Ensure validation error occurs for invalid rating
            expect(error).toBeDefined();
            expect(error.errors.rating).toBeDefined(); // Rating field validation should fail
        });

        // Test case 4: Hotel reference is required
        test(`${reviewBoundaryTest} should throw an error if hotel reference is not provided`, async () => {
            const invalidReview = new Review({
                author: 'Test User',
                comment: 'Nice place.',
                rating: 4,
            });

            let error;
            try {
                await invalidReview.save();
            } catch (err) {
                error = err;
            }

            // Assertions: Ensure validation error occurs due to missing hotel reference
            expect(error).toBeDefined();
            expect(error.errors.hotel).toBeDefined(); // Hotel is required but missing
        });

        // Test case 5: Check that createdAt and updatedAt fields are populated
        test(`${reviewBoundaryTest} should have createdAt and updatedAt timestamps`, async () => {
            const reviewData = {
                author: 'John Smith',
                comment: 'Loved the stay!',
                rating: 5,
                hotel: hotel._id,
            };

            const review = new Review(reviewData);
            await review.save();

            // Assertions: Ensure timestamps are automatically set
            expect(review.createdAt).toBeDefined();
            expect(review.updatedAt).toBeDefined();
        });
    });
});