// server.js
// Import the Express application instance from app.js
const app = require('./app');

// Define the port number where the server will listen for requests
// If an environment variable PORT is set, it will use that; otherwise, it defaults to 3000
const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Log a message to the console indicating the server is running and the port it's using
  console.log(`Server running on port ${PORT}`);
});
