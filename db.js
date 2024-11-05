// db.js

// Import the sqlite3 module and enable verbose mode for detailed logging
const sqlite3 = require('sqlite3').verbose();

// Create an in-memory SQLite database for testing purposes
const db = new sqlite3.Database(':memory:');

// Initialize the database schema
db.serialize(() => {
  // Create the Contact table if it doesn't already exist
  db.run(`CREATE TABLE IF NOT EXISTS Contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  // Unique identifier for each contact
    phoneNumber TEXT,                       // Phone number of the contact
    email TEXT,                             // Email address of the contact
    linkedId INTEGER,                       // ID of another contact this one is linked to
    linkPrecedence TEXT CHECK(linkPrecedence IN ('primary', 'secondary')), // Defines link type; can be 'primary' or 'secondary'
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, // Timestamp when the contact was created
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, // Timestamp when the contact was last updated
    deletedAt DATETIME                       // Timestamp when the contact was marked as deleted (soft delete)
  )`);
});

// Export the database instance for use in other modules
module.exports = db;
