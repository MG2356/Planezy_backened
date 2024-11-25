const express = require('express');
const mongoose = require('mongoose');
const TripModel = require('./Schema/Trip');
const FlightModel = require('./Schema/Flight');
const HotelModel = require('./Schema/Hotel');
const CarModel = require('./Schema/Car');
const RestaurantModel = require('./Schema/Restaurant');
const MeetingModel = require('./Schema/Meeting');
const RailModel = require('./Schema/Rail');
const ActivityModel = require('./Schema/Activity');
const jwt = require('jsonwebtoken');
const CommunityModel=require("./Schema/Community");
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
//Meeting 
router.post('/addMeetingToTrip', authenticateToken, async (req, res) => {
  const { tripId, meetingDetails } = req.body;

  if (!tripId || !meetingDetails) {
    return res.status(400).json({ error: 'Trip ID and restaurant details are required' });
  }

  try {
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found or does not belong to this user' });

    const meeting = new MeetingModel({ ...meetingDetails, tripId });
    await meeting.save();

    trip.meetingDetails = meeting._id;
    await trip.save();

    res.json({ message: 'meeting Details added to the trip successfully', trip });
  } catch (err) {
    console.error("Error adding meeting details: ", err);
    res.status(500).json({ error: 'Error adding meeting details' });
  }
});
//Rail
router.post('/addRailToTrip', authenticateToken, async (req, res) => {
  const { tripId, railDetails } = req.body;

  if (!tripId || !railDetails) {
    return res.status(400).json({ error: 'Trip ID and restaurant details are required' });
  }

  try {
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found or does not belong to this user' });

    const rail = new RailModel({ ...railDetails, tripId });
    await rail.save();

    trip.railDetails = rail._id;
    await trip.save();

    res.json({ message: 'rail Details added to the trip successfully', trip });
  } catch (err) {
    console.error("Error adding rail details: ", err);
    res.status(500).json({ error: 'Error adding rail details' });
  }
});
//Acitivity
router.post('/addActivityToTrip', authenticateToken, async (req, res) => {
  const { tripId, activityDetails } = req.body;

  if (!tripId || !activityDetails) {
    return res.status(400).json({ error: 'Trip ID and restaurant details are required' });
  }

  try {
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found or does not belong to this user' });

    const activity = new ActivityModel({ ...activityDetails, tripId });
    await activity.save();

    trip.activityDetails = activity._id;
    await trip.save();

    res.json({ message: 'activity Details added to the trip successfully', trip });
  } catch (err) {
    console.error("Error adding activity details: ", err);
    res.status(500).json({ error: 'Error adding activity details' });
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
  // Route to get complete trip details including all itinerary items
router.get('/tripDetails/:tripId', authenticateToken, async (req, res) => {
  const { tripId } = req.params;

  try {
    // Check if tripId is valid
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid Trip ID format' });
    }

    // Find the trip by ID for the logged-in user and populate all itinerary details
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId })
      .populate('flightDetails')    // Populate flight details
      .populate('carDetails')       // Populate car details
      .populate('hotelDetails')     // Populate hotel details
      .populate('restaurantDetails') // Populate restaurant details
      .populate('meetingDetails')
      .populate('railDetails')
      .populate('activityDetails');
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Send the trip details with all populated itinerary data
    res.json({ trip });
  } catch (err) {
    console.error("Error fetching complete trip details:", err);
    res.status(500).json({ error: 'Error fetching complete trip details' });
  }
});

  // API to delete a trip
router.delete('/deleteTrip/:tripId', authenticateToken, async (req, res) => {
  const { tripId } = req.params;

  try {
    // Validate Trip ID format
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid Trip ID format' });
    }

    // Find the trip by ID and ensure it belongs to the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Delete associated itinerary details
    const deletePromises = [];
    if (trip.flightDetails) deletePromises.push(FlightModel.findByIdAndDelete(trip.flightDetails));
    if (trip.carDetails) deletePromises.push(CarModel.findByIdAndDelete(trip.carDetails));
    if (trip.hotelDetails) deletePromises.push(HotelModel.findByIdAndDelete(trip.hotelDetails));
    if (trip.restaurantDetails) deletePromises.push(RestaurantModel.findByIdAndDelete(trip.restaurantDetails));
    if (trip.meetingDetails) deletePromises.push(MeetingModel.findByIdAndDelete(trip.meetingDetails));
    if (trip.railDetails) deletePromises.push(RailModel.findByIdAndDelete(trip.railDetails));
    if (trip.activityDetails) deletePromises.push(ActivityModel.findByIdAndDelete(trip.activityDetails));

    await Promise.all(deletePromises);

    // Delete the trip itself
    await TripModel.findByIdAndDelete(tripId);

    res.json({ message: 'Trip and associated details deleted successfully' });
  } catch (err) {
    console.error('Error deleting trip:', err);
    res.status(500).json({ error: 'Error deleting trip' });
  }
});


module.exports = router;
