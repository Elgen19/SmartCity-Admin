// routes/signupRoutes.js
const express = require('express');
const router = express.Router();
const signupController = require('../controllers/signUpController');

// Define the routes and link them to the controller methods
router.get('/verify-invite', signupController.verifySignupInvite);
router.post('/signup', signupController.signup);

module.exports = router;
