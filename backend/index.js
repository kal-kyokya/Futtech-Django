// Create an express server
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routing from './routes/index.js';

// Initialize an Express instance representing the app
const app = express();

// Makes the app capable of processing JSON data from req.body
app.use(express.json());

// To handle form data
app.use(express.urlencoded({ extended: true }));

// Initialize the app for Cross Origin Resource Sharing
app.use(cors({
    origin: ['http://localhost:5174', 'https:futtech.kalkyokya.tech'],
    credentials: true, // Because we are using cookies
}));

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
});

mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('\nDB Connection - Success'))
  .catch((err) => console.log(err));
