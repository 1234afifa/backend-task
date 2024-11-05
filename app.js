// app.js
const express = require('express');  // Import the Express framework
const db = require('./db');          // Import the SQLite database connection
const app = express();               // Create an Express application instance
app.use(express.json());             // Use JSON middleware to parse JSON request bodies

// Define the POST /identify endpoint
app.post('/identify', (req, res) => {
  const { email, phoneNumber } = req.body;  // Destructure email and phoneNumber from the request body

  // Check if at least one of email or phoneNumber is provided
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  // Query the database for contacts matching the provided email or phone number
  db.all(`SELECT * FROM Contact WHERE email = ? OR phoneNumber = ?`, [email, phoneNumber], (err, rows) => {
    // Handle any potential database error
    if (err) return res.status(500).json({ error: 'Database error' });

    // Case 1: No matching contacts were found
    if (rows.length === 0) {
      // Insert a new primary contact
      db.run(`INSERT INTO Contact (email, phoneNumber, linkPrecedence) VALUES (?, ?, 'primary')`, [email, phoneNumber], function(err) {
        // Handle any potential error during insertion
        if (err) return res.status(500).json({ error: 'Database error' });

        // Respond with the new contact's ID, and arrays for emails and phone numbers
        res.status(200).json({
          primaryContactId: this.lastID,
          emails: [email],
          phoneNumbers: [phoneNumber],
          secondaryContactIds: []
        });
      });

    } else { // Case 2: Matching contacts were found in the database
      // Find the primary contact from the existing entries, or default to the first contact
      let primaryContact = rows.find(row => row.linkPrecedence === 'primary') || rows[0];
      // Collect IDs of all secondary contacts that match the query
      let secondaryContactIds = rows.filter(row => row.id !== primaryContact.id).map(row => row.id);

      // Update any existing primary contacts to secondary, linking them to the main primary contact
      rows.forEach(row => {
        if (row.linkPrecedence === 'primary' && row.id !== primaryContact.id) {
          db.run(`UPDATE Contact SET linkPrecedence = 'secondary', linkedId = ? WHERE id = ?`, [primaryContact.id, row.id]);
        }
      });

      // If the current request has new information, insert it as a secondary contact
      if (!rows.some(row => row.email === email && row.phoneNumber === phoneNumber)) {
        db.run(`INSERT INTO Contact (email, phoneNumber, linkPrecedence, linkedId) VALUES (?, ?, 'secondary', ?)`, [email, phoneNumber, primaryContact.id]);
        // Add the new secondary contact's ID to the list
        secondaryContactIds.push(this.lastID);
      }

      // Construct the response with consolidated contact data
      res.status(200).json({
        primaryContactId: primaryContact.id,  // ID of the primary contact
        emails: [...new Set(rows.map(row => row.email).filter(Boolean))], // Unique list of emails
        phoneNumbers: [...new Set(rows.map(row => row.phoneNumber).filter(Boolean))], // Unique list of phone numbers
        secondaryContactIds: secondaryContactIds // IDs of all secondary contacts linked to the primary contact
      });
    }
  });
});

// Export the app instance so it can be used by the server or test files
module.exports = app;
