const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const authRoutes = require('./routes/auth.routes');
const jokeRoutes = require('./routes/joke.routes');  // Assuming this exists for joke moderation
const app = express();

dotenv.config();
app.use(express.json());  // To handle JSON body

app.use('/auth', authRoutes);
app.use('/moderate', jokeRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,  // Force SSL connection
    tlsAllowInvalidCertificates: true  // Allow invalid certificates (useful in development)
}).then(() => {
    console.log('Connected to MongoDB for joke moderation.');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Moderate Jokes service is running on port ${port}`);
});
