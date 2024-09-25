const mongoose = require('mongoose');

const jokeSchema = new mongoose.Schema({
    content: String,
    type: String,
    status: { type: String, default: 'pending' },  // 'pending', 'approved', 'rejected'
});

const Joke = mongoose.model('Joke', jokeSchema);
module.exports = Joke;
