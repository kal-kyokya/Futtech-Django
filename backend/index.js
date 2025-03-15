// Create an express server
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routing from './routes/index';

// Store an Express instance representing the app
const app = express();

// Enable access to the '.env' file
dotenv.config();

// Extract environment variables found in '.env'
const PORT = process.env.EXPRESS_PORT || 8000;
const URL = process.env.MONGO_URL;

// Initialize the app
app.use(cors());

// Ensure the app processes json data accordingly
app.use(express.json());

// Handle routing inside a function that manipulates the app object
routing(app);

// Run the server on the designated port
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}\n`);
});

mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('\nDB Connection - Success'))
  .catch((err) => console.log(err));
