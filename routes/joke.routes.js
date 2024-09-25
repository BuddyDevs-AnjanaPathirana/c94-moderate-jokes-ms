const express = require('express');
const router = express.Router();
const jokeController = require('../controllers/joke.controller');
const verifyToken = require('../middleware/auth');

// Get pending joke
router.get('/jokes', verifyToken, jokeController.getPendingJoke);

// Approve or reject a joke
router.put('/jokes/:id', verifyToken, jokeController.moderateJoke);

module.exports = router;
