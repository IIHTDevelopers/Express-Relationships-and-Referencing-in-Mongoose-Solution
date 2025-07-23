const request = require('supertest');
const app = require('../../app'); // Assuming your main Express app is exported from 'app.js'
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Hotel = require('../../models/hotel');
const Review = require('../../models/review');
const RoomType = require('../../models/roomType');

let mongoServer;

beforeAll(async () => {
  // Set up MongoDB in-memory server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Close MongoDB connection and stop the in-memory server
  await mongoose.disconnect();
  await mongoServer.stop();
});

let hotelRoutesBoundaryTest = `HotelRoutes boundary test`;

describe('Hotel Routes', () => {
  describe('boundary', () => {

    let hotel, review, roomType;

    beforeEach(async () => {
      // Create sample hotel, review, and roomType
      hotel = new Hotel({
        name: 'Hotel California',
        location: 'California',
        price: 200,
        rooms: 100,
      });
      await hotel.save();

      roomType = new RoomType({
        type: 'Suite',
        description: 'A luxurious suite with an ocean view.',
        price: 250,
      });
      await roomType.save();

      review = new Review({
        author: 'John Doe',
        comment: 'Great hotel!',
        rating: 5,
        hotel: hotel._id,
      });
      await review.save();
    });

    afterEach(async () => {
      // Clean up the database after each test
      await Hotel.deleteMany();
      await Review.deleteMany();
      await RoomType.deleteMany();
    });

    // Test case 1: Create a new hotel
    test(`${hotelRoutesBoundaryTest} should create a new hotel`, async () => {
      const newHotel = {
        name: 'Mountain Resort',
        location: 'Colorado',
        price: 300,
        rooms: 50,
      };

      const response = await request(app)
        .post('/api/hotels')
        .send(newHotel)
        .expect(201);

      expect(response.body.message).toBe('Hotel successfully added!');
      expect(response.status).toBe(201);
    });

    // Test case 2: Get all hotels
    test(`${hotelRoutesBoundaryTest} should retrieve all hotels`, async () => {
      const response = await request(app)
        .get('/api/hotels')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    // Test case 3: Get a single hotel with its reviews
    test(`${hotelRoutesBoundaryTest} should retrieve a single hotel with its reviews`, async () => {
      const response = await request(app)
        .get(`/api/hotels/${hotel._id}`)
        .expect(200);

      expect(response.body.name).toBe('Hotel California');
    });

    // Test case 4: Add a review to a hotel
    test(`${hotelRoutesBoundaryTest} should add a review to a hotel`, async () => {
      const newReview = {
        author: 'Jane Doe',
        comment: 'Amazing place!',
        rating: 5,
      };

      const response = await request(app)
        .post(`/api/hotels/${hotel._id}/reviews`)
        .send(newReview)
        .expect(201);

      expect(response.body.author).toBe('Jane Doe');
      expect(response.body.comment).toBe('Amazing place!');
      expect(response.body.rating).toBe(5);
    });

    // Test case 6: Create a new room type
    test(`${hotelRoutesBoundaryTest} should create a new room type`, async () => {
      const newRoomType = {
        type: 'Penthouse',
        description: 'A luxurious penthouse with panoramic views.',
        price: 500,
      };

      const response = await request(app)
        .post('/api/room-types')
        .send(newRoomType)
        .expect(201);

      expect(response.body.type).toBe('Penthouse');
      expect(response.body.price).toBe(500);
    });

    // Test case 7: Link a room type to a hotel (many-to-many relationship)
    test(`${hotelRoutesBoundaryTest} should link a room type to a hotel`, async () => {
      const response = await request(app)
        .post(`/api/hotels/${hotel._id}/room-types/${roomType._id}`)
        .expect(200);

      expect(response.body.message).toBe('Room type linked to hotel successfully');
    });

    // Test case 9: Delete a hotel
    test(`${hotelRoutesBoundaryTest} should delete a hotel`, async () => {
      const response = await request(app)
        .delete(`/api/hotels/${hotel._id}`)
        .expect(200);

      expect(response.body.message).toBe('Hotel deleted successfully');
    });

    // Test case 10: Delete a review for a hotel
    test(`${hotelRoutesBoundaryTest} should delete a review for a hotel`, async () => {
      const response = await request(app)
        .delete(`/api/hotels/${hotel._id}/reviews/${review._id}`)
        .expect(200);

      expect(response.body.message).toBe('Review deleted successfully');
    });
  });
});
