// server/app.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors'); // Import CORS
const bodyParser = require('body-parser');
const inviteRoutes = require('./routes/inviteRoutes');
const signupRoutes = require('./routes/signUpRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// Routes
app.use('/api/invites', inviteRoutes);
app.use('/api', signupRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
