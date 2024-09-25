const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');  // MySQL connection from db.js
const dotenv = require('dotenv');
dotenv.config();

// Login function to authenticate the user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user by email
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).send('User not found.');
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send('Invalid email or password.');
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the token to the client
        return res.json({ token });
    } catch (error) {
        console.error('Login error:', error);  // Log the error for debugging
        return res.status(500).send('Error during login.');
    }
};


// // Register function to create a new user
// exports.register = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Check if the user already exists
//         const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
//         if (existingUser.length > 0) {
//             return res.status(400).send('User already exists.');
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);  // 12 is the salt rounds

//         // Insert new user into the database
//         const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

//         // Respond with success message
//         res.status(201).send('User registered successfully.');
//     } catch (error) {
//         console.error('Registration error:', error);  // Log error
//         res.status(500).send('Error during registration.');
//     }
// };