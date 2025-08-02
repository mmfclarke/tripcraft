const mongoose = require('mongoose');
const fetch = require('node-fetch');

const tripSchema = new mongoose.Schema({
  // Trip schema
  tripName: { type: String, required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  travelers: { type: Number, required: true },
  username: { type: String, required: true }, // Link trip to user
  // Itinerary is an array of { day: 'Day 1', activities: [...] }
  itinerary: [
    {
      day: { type: String },
      activities: [
        {
          startTime: { type: String },
          activity: { type: String },
          cost: { type: Number },
          notes: { type: String }
        }
      ]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const Trip = mongoose.model('Trip', tripSchema);
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend connection (must be before routes)
app.use(cors({
  origin: 'http://localhost:3000', // My React app's URL
  credentials: true
}));

// Parse JSON bodies (must be before routes)
app.use(express.json());

// Update Trip (itinerary and details)
app.put('/trips/:id', async (req, res) => {
  try {
    const update = req.body || {};
    console.log('--- PUT /trips/:id called ---');
    console.log('Request body:', JSON.stringify(update, null, 2));
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      console.log('Trip not found for id:', req.params.id);
      return res.status(404).json({ error: 'Trip not found' });
    }
    // Update main trip fields if present
    if ('tripName' in update) trip.tripName = update.tripName;
    if ('destination' in update) trip.destination = update.destination;
    if ('startDate' in update) trip.startDate = update.startDate;
    if ('endDate' in update) trip.endDate = update.endDate;
    if ('travelers' in update) trip.travelers = update.travelers;

    if ('itinerary' in update) {
      if (Array.isArray(update.itinerary)) {
        // Replace the entire itinerary with the incoming array, validating each day and activity
        const processedItinerary = update.itinerary.map(dayObj => ({
          day: dayObj.day || '',
          activities: Array.isArray(dayObj.activities)
            ? dayObj.activities.map(a => ({
                startTime: a.startTime || '',
                activity: a.activity || '',
                cost: typeof a.cost === 'number' ? a.cost : (a.cost === '' || a.cost === null || isNaN(Number(a.cost)) ? null : Number(a.cost)),
                notes: a.notes || ''
              }))
            : []
        }));
        console.log('Processed itinerary to save:', JSON.stringify(processedItinerary, null, 2));
        trip.itinerary = processedItinerary;
      } else {
        trip.itinerary = [];
      }
    }
    try {
      await trip.save();
      console.log('Trip updated successfully. Saved itinerary:', JSON.stringify(trip.itinerary, null, 2));
      res.json({ message: 'Trip updated successfully', trip });
    } catch (saveErr) {
      console.error('Error saving trip:', saveErr);
      res.status(500).json({ error: 'Failed to save trip', details: saveErr.message });
    }
  } catch (error) {
    console.error('Update trip error:', error);
    if (error.errors) {
      // Mongoose validation errors
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Enable CORS for frontend connection
app.use(cors({
  origin: 'http://localhost:3000', // My React app's URL
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
if (!process.env.MONGODB_CONNECTION_STRING) {
  console.error('MongoDB connection string not found in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Routes

// Create Trip
app.post('/trips', async (req, res) => {
  try {
    const { tripName, destination, startDate, endDate, travelers, username } = req.body;
    if (!tripName || !destination || !startDate || !endDate || !travelers || !username) {
      return res.status(400).json({ error: 'All fields are required, including username' });
    }
    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const startMs = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endMs = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const numDays = Math.max(1, Math.floor((endMs - startMs) / msPerDay) + 1);
    // Initialize itinerary with empty activities array for each day
    const itinerary = Array.from({ length: numDays }, (_, i) => ({
      day: `Day ${i + 1}`,
      activities: []
    }));
    const trip = new Trip({
      tripName,
      destination,
      startDate,
      endDate,
      travelers,
      username,
      itinerary
    });
    await trip.save();
    res.status(201).json({ message: 'Trip created successfully', trip });
  } catch (error) {
    console.error('Trip creation error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

// Register
app.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { username, password, confirmPassword } = req.body;

    // Basic validation
    if (!username || username.length < 5) {
      console.log('Username validation failed');
      return res.status(400).json({ error: 'Username must be at least 5 characters' });
    }
    if (!password || password.length < 8) {
      console.log('Password validation failed');
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (password !== confirmPassword) {
      console.log('Password confirmation failed');
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Username already exists');
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create user (password will be hashed by pre-save middleware)
    const newUser = new User({ username, password });
    await newUser.save();
    
    console.log('User created successfully:', newUser.username);
    res.json({ 
      message: 'Account created successfully', 
      user: { id: newUser._id, username: newUser.username } 
    });
  } catch (error) {
    console.error('Registration error details:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0].message;
      console.error('Validation error:', firstError);
      return res.status(400).json({ error: firstError });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }


    // Check password
    const isPasswordCorrect = await user.correctPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({ 
      message: 'Login successful', 
      user: { id: user._id, username: user.username } 
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get Trip by ID
app.get('/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json({ trip });
  } catch (error) {
    console.error('Get trip by ID error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


// Get all trips (for dashboard list)
app.get('/trips', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const trips = await Trip.find({ username }, '-itinerary -__v').sort({ createdAt: -1 });
    res.json({ trips });
  } catch (error) {
    console.error('Get all trips error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Safety Tips endpoint - microservice integration
app.post('/trips/:id/safety-tips', async (req, res) => {
  try {
    const { id } = req.params;
    // Get trip data from database
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ 
        success: false, 
        error: 'Trip not found' 
      });
    }

    // Prepare data for microservice (matching your teammate's expected format)
    const safetyTipsRequest = {
      location: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      numberOfTravelers: trip.travelers // Note: your schema uses 'travelers', their API expects 'numberOfTravelers'
    };

    // Call the Safety Tips microservice
    const microserviceUrl = process.env.SAFETY_MICROSERVICE_URL || 'http://localhost:3001';

    console.log('Calling microservice with data:', safetyTipsRequest);

    const response = await fetch(`${microserviceUrl}/safety-tips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(safetyTipsRequest)
    });

    if (!response.ok) {
      throw new Error(`Microservice responded with status: ${response.status}`);
    }

    const safetyTipsData = await response.json();

    // Return the safety tips to frontend exactly as received
    res.json({
      success: true,
      tripId: id,
      safetyTips: safetyTipsData
    });

  } catch (error) {
    console.error('Error fetching safety tips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch safety tips',
      details: error.message
    });
  }
});

// Delete trip by ID
app.delete('/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
