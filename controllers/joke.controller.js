const Joke = require('../models/joke.model');
const pool = require('../db');

// Get a pending joke for moderation
exports.getPendingJoke = async (req, res) => {
    try {
        const joke = await Joke.findOne({ status: 'pending' });
        if (!joke) {
            return res.status(404).send('No jokes pending for moderation.');
        }
        res.json(joke);
    } catch (error) {
        res.status(500).send('Error retrieving jokes for moderation.');
    }
};

// Approve or reject a joke
exports.moderateJoke = async (req, res) => {
    const { action, content, type } = req.body;  // 'approve' or 'reject' 

    try {
        const joke = await Joke.findById(req.params.id);
        if (!joke) return res.status(404).send('Joke not found.');

        if (action === 'approve') {
            // Update joke content or type if necessary
            joke.content = content || joke.content;
            joke.type = type || joke.type;
            joke.status = 'approved';
            await joke.save();

            // Save the approved joke to MySQL
            // Fetch the type id from joke_types based on the type name
            const [rows] = await pool.query('SELECT id FROM joke_types WHERE name = ?', [joke.type]);
            if (rows.length === 0) {
                return res.status(400).send('Invalid joke type.');
            }
            const typeId = rows[0].id;

            // Insert the joke into MySQL using the type ID
            const sql = 'INSERT INTO jokes (content, typeId) VALUES (?, ?)';
            await pool.query(sql, [joke.content, typeId]);

            // Remove the joke from MongoDB
            await Joke.findByIdAndDelete(req.params.id);
            res.send('Joke approved and saved to MySQL.');
        } else if (action === 'reject') {
            await Joke.findByIdAndDelete(req.params.id);
            res.send('Joke rejected and removed from MongoDB.');
        } else {
            res.status(400).send('Invalid action. Use "approve" or "reject".');
        }
    } catch (error) {
        res.status(500).send('Error moderating joke.');
        console.log(error);
    }
};


// Create a new joke type
exports.createJokeType = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).send('Joke type name is required.');
    }

    try {
        // Check if the joke type already exists
        const [rows] = await pool.query('SELECT * FROM joke_types WHERE name = ?', [name]);
        if (rows.length > 0) {
            return res.status(400).send('Joke type already exists.');
        }

        // Insert the new joke type into MySQL
        const sql = 'INSERT INTO joke_types (name) VALUES (?)';
        await pool.query(sql, [name]);

        res.send('Joke type created successfully.');
    } catch (error) {
        res.status(500).send('Error creating joke type.');
        console.log(error);
    }
};

