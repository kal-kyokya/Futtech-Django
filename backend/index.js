// Create an express server
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routing from './routes/index.js';

// Initialize an Express instance representing the app
const app = express();

// Initialize the app for Cross Origin Resource Sharing
const corsOptions = {
    origin: ['http://localhost:5174', 'https://futtech.kalkyokya.tech'], //Allowed origins
    methods: ['GET', 'POST', 'PUT',
	      'DELETE', 'OPTIONS'], // Allowed HTTP Verbs
    allowedHeaders: ['Content-Type', 'auth-token'], // Allowed non-standard headers
    credentials: true, // For usage of cookies or HTTP auth
}

app.use(cors(corsOptions));

// Makes the app capable of processing JSON data from req.body
app.use(express.json());

// To handle form data
app.use(express.urlencoded({ extended: true }));

// Enable access to the '.env' file
dotenv.config();

// Extract environment variables found in '.env'
const PORT = process.env.EXPRESS_PORT || 8000;
const URI = process.env.MONGO_URI;

// Handle routing inside a function that manipulates the app object
routing(app);

// Run the server on the designated port
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}\n`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
	console.error(`Port ${PORT} is already in use...`);
	process.exit(1);
    } else {
	throw err;
    }
});

mongoose
  .connect(URI)
  .then(() => console.log('\nDB Connection - Success'))
  .catch((err) => console.log(err));
