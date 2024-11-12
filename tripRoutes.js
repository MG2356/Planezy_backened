const express = require('express');
const TripModel = require('./Schema/Trip');
const FlightModel = require('./Schema/Flight');
const HotelModel = require('./Schema/Hotel');
const CarModel = require('./Schema/Car');
const RestaurantModel = require('./Schema/Restaurant');
const jwt = require('jsonwebtoken');
const CommunityModel=require("./Schema/Community");
const mongoose = require('mongoose');

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

// Middleware for Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);  // Unauthorized if no token is found

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.sendStatus(403);  // Forbidden if token is invalid
    req.userId = decoded.userId;
    next();
  });
};
router.post('/createPost', authenticateToken, (req, res) => {
  const communityData = {
    ...req.body,
    userId: req.userId, // Attach the authenticated user's ID
  };

  CommunityModel.create(communityData)
    .then(CommunityData => {
      res.json({ CommunityData });
    })
    .catch(err => {
      console.log("Error during adding the place: ", err);
      res.status(500).send('Error creating community post');
    });
});

// Route to add flight details to an existing trip
router.post('/addFlightToTrip', authenticateToken, async (req, res) => {
  const { tripId, flightDetails } = req.body;

  if (!tripId || !flightDetails) {
    return res.status(400).json({ error: 'Trip ID and flight details are required' });
  }

  try {
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found or does not belong to this user' });

    const flight = new FlightModel({ ...flightDetails, tripId });
    await flight.save();

    trip.flightDetails = flight._id;
    await trip.save();

    res.json({ message: 'Flight details added to the trip successfully', trip });
  } catch (err) {
    console.error("Error adding flight details: ", err);
    res.status(500).json({ error: 'Error adding flight details' });
  }
});
//Car 
router.post('/addCarToTrip', authenticateToken, async (req, res) => {
    const { tripId, carDetails } = req.body;
  
    if (!tripId || !carDetails) {
      return res.status(400).json({ error: 'Trip ID and flight details are required' });
    }
  
    try {
      const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
      if (!trip) return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
  
      const car = new CarModel({ ...carDetails, tripId });
      await car.save();
  
      trip.carDetails = car._id;
      await trip.save();
  
      res.json({ message: 'Flight details added to the trip successfully', trip });
    } catch (err) {
      console.error("Error adding flight details: ", err);
      res.status(500).json({ error: 'Error adding flight details' });
    }
  });
//hotel
  router.post('/addHotelToTrip', authenticateToken, async (req, res) => {
    const { tripId, hotelDetails } = req.body;
  
    if (!tripId || !hotelDetails) {
      return res.status(400).json({ error: 'Trip ID and hotel details are required' });
    }
  
    try {
      const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
      if (!trip) return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
  
      const hotel = new HotelModel({ ...hotelDetails, tripId });
      await hotel.save();
  
      trip.hotelDetails = hotel._id;
      await trip.save();
  
      res.json({ message: 'Hotels details added to the trip successfully', trip });
    } catch (err) {
      console.error("Error adding hotel details: ", err);
      res.status(500).json({ error: 'Error adding hotel details' });
    }
  });
  //restaurant 
  router.post('/addRestaurantToTrip', authenticateToken, async (req, res) => {
    const { tripId, restaurantDetails } = req.body;
  
    if (!tripId || !restaurantDetails) {
      return res.status(400).json({ error: 'Trip ID and restaurant details are required' });
    }
  
    try {
      const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
      if (!trip) return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
  
      const restaurant = new RestaurantModel({ ...restaurantDetails, tripId });
      await restaurant.save();
  
      trip.restaurantDetails = restaurant._id;
      await trip.save();
  
      res.json({ message: 'restaurant details added to the trip successfully', trip });
    } catch (err) {
      console.error("Error adding hotel details: ", err);
      res.status(500).json({ error: 'Error adding hotel details' });
    }
  });

// Add Hotel, Car, Restaurant similar to above route...
router.post('/addTrip', authenticateToken, (req, res) => {
    const tripData = { ...req.body, userId: req.userId };
  
    TripModel.create(tripData)
      .then(trip => res.json({ trip }))
      .catch(err => {
        console.log("Error during adding the trip: ", err);
        res.status(500).json({ error: 'Error adding trip' });
      });
  });
  
  // Get User's Trips Route (Requires Authentication)
  router.get('/myTrips', authenticateToken, async (req, res) => {
    try {
      const trips = await TripModel.find({ userId: req.userId });
      res.json({ trips });
    } catch (err) {
      console.error("Error fetching user's trips:", err);
      res.status(500).json({ error: 'Error fetching trips' });
    }
  });

  router.get('/userTrips', authenticateToken, async (req, res) => {
    try {
      // Find all trips for the logged-in user and populate the flight details
      const trips = await TripModel.find({ userId: req.userId })
        .populate('flightDetails')  // Populating the flight details for each trip
        .populate('hotelDetails')   // Optionally, populate other related details
        .populate('carDetails')
        .populate('restaurantDetails');
  
      res.json({ trips });
    } catch (err) {
      console.error("Error fetching user's trips:", err);
      res.status(500).json({ error: 'Error fetching trips' });
    }
  });
  
  // Get Flight Details for a Specific Trip
  router.get('/flightTrip/:tripId', authenticateToken, async (req, res) => {
    try {
      const tripId = req.params.tripId;
  
      // Find the trip by ID for the logged-in user and populate the flight details
      const trip = await TripModel.findOne({ _id: tripId, userId: req.userId })
        .populate('flightDetails');  // Populating flight details for the specified trip
  
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
      }
  
      res.json({ flightDetails: trip.flightDetails });
    } catch (err) {
      console.error("Error fetching flight details for trip:", err);
      res.status(500).json({ error: 'Error fetching flight details' });
    }
  });

  router.get('/communityPosts/:userId', async (req, res) => {
    try {
      const { userId } = req.params; // Get userId from request params
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid userId format' });
      }
  
      // Find community posts by userId
      const userPosts = await CommunityModel.find({ userId })
        .populate('userId', 'firstName lastName email');
  
      if (userPosts.length === 0) {
        return res.status(404).json({ message: 'No posts found for this user' });
      }
  
      res.json({ userPosts });
    } catch (error) {
      console.error('Error fetching community posts for user:', error);
      res.status(500).json({ message: 'Error fetching community posts for user', error: error.message });
    }
  });
  
  
module.exports = router;
