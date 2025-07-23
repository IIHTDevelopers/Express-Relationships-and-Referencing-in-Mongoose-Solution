const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

let roomTypeBoundaryTest = `RommTypeModel boundary test`;

describe('RoomType Model', () => {
    describe('boundary', () => {

        // Test case 1: Create a valid room type
        test(`${roomTypeBoundaryTest} should create a room type with valid data`, async () => {
            const roomTypeData = {
                type: 'Suite',
                description: 'A luxurious suite with an ocean view.',
                price: 250
            };

            const roomType = new RoomType(roomTypeData);
            await roomType.save();

            // Assertions
            expect(roomType).toHaveProperty('_id');
            expect(roomType.type).toBe('Suite');
            expect(roomType.description).toBe('A luxurious suite with an ocean view.');
            expect(roomType.price).toBe(250);
        });

        // Test case 2: Create a room type with missing required fields
        test(`${roomTypeBoundaryTest} should throw an error if required fields are missing`, async () => {
            const invalidRoomTypeData = {
                type: 'Deluxe Room',
                price: 150
            };

            const roomType = new RoomType(invalidRoomTypeData);

            let error;
            try {
                await roomType.save();
            } catch (err) {
                error = err;
            }

            // Assertions: Ensure validation error occurs for missing description
            expect(error).toBeDefined();
            expect(error.errors.description).toBeDefined();
        });

        // Test case 3: Ensure price is required
        test(`${roomTypeBoundaryTest} should throw an error if price is missing`, async () => {
            const invalidRoomType = new RoomType({
                type: 'Standard Room',
                description: 'A basic room without a view.'
            });

            let error;
            try {
                await invalidRoomType.save();
            } catch (err) {
                error = err;
            }

            // Assertions: Ensure validation error occurs for missing price
            expect(error).toBeDefined();
            expect(error.errors.price).toBeDefined();
        });

        // Test case 5: Check if createdAt and updatedAt are automatically populated
        test(`${roomTypeBoundaryTest} should have createdAt and updatedAt timestamps`, async () => {
            const roomTypeData = {
                type: 'Penthouse Suite',
                description: 'A luxurious suite at the top of the building.',
                price: 500
            };

            const roomType = new RoomType(roomTypeData);
            await roomType.save();

            // Assertions: Ensure timestamps are automatically set
            expect(roomType.createdAt).toBeDefined();
            expect(roomType.updatedAt).toBeDefined();
        });
    });
});
