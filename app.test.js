// app.test.js
const request = require('supertest'); // Import the supertest library for HTTP assertions
const app = require('./app');           // Import the Express application instance
const db = require('./db');             // Import the database connection

// Run this setup before all tests
beforeAll(done => {
  // Clear the Contact table to start with a clean state for tests
  db.run(`DELETE FROM Contact`, done);
});

// Group of tests for the /identify endpoint
describe('POST /identify', () => {
  // Test case to check creating a new primary contact
  it('should create a new primary contact', async () => {
    // Send a POST request to /identify with a new contact's details
    const response = await request(app)
      .post('/identify')
      .send({ email: 'doc@example.com', phoneNumber: '1234567890' });
    
    // Expect a successful response with status code 200
    expect(response.statusCode).toBe(200);
    // Check that a primary contact ID is defined in the response
    expect(response.body.primaryContactId).toBeDefined();
    // Verify that the response contains the provided email
    expect(response.body.emails).toContain('doc@example.com');
    // Verify that the response contains the provided phone number
    expect(response.body.phoneNumbers).toContain('1234567890');
  });

  // Test case to check linking contacts with overlapping information
  it('should link contacts with overlapping info', async () => {
    // Send a POST request to /identify with overlapping contact details
    const response = await request(app)
      .post('/identify')
      .send({ email: 'alt@example.com', phoneNumber: '1234567890' });
    
    // Expect a successful response with status code 200
    expect(response.statusCode).toBe(200);
    // Check that a primary contact ID is defined in the response
    expect(response.body.primaryContactId).toBeDefined();
    // Ensure that the response includes secondary contact IDs
    expect(response.body.secondaryContactIds.length).toBeGreaterThan(0);
  });

  // Test case to check handling of invalid requests
  it('should return 400 for invalid requests', async () => {
    // Send a POST request to /identify without any body
    const response = await request(app)
      .post('/identify')
      .send({});
    
    // Expect a 400 status code for bad request
    expect(response.statusCode).toBe(400);
    // Check that the response contains the appropriate error message
    expect(response.body.error).toBe('Email or phone number is required.');
  });
});
