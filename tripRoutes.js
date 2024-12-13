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
const SignupModel = require("./Schema/Signup");
const nodemailer = require('nodemailer');

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
const transporter = nodemailer.createTransport({
  service: 'gmail', // If using Gmail
  auth: {
    user: 'planezyalerts@gmail.com', // Your email address
    pass: 'cgjhklxeynovbbax', // Your app password or actual email password
  },
});
router.put('/useredit', authenticateToken, async (req, res) => {
  const { firstName, lastName } = req.body;

  try {
    // Extract user ID from authenticated token
    const userId = req.userId; // Assume authenticateToken middleware sets req.userId

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Token is missing or invalid.' });
    }

    // Update the user's details
    const updatedUser = await SignupModel.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true, runValidators: true } // Return the updated document and apply schema validation
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json({ message: 'User updated successfully!', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user.', error });
  }
});
router.delete('/deleteAccount', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // Extract user ID from the authenticated token

    // Check if the user exists
    const user = await SignupModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send account deletion email
    const mailOptions = {
     // from: 'your-email@gmail.com',
      from: `PlanEzy <planezyalerts@gmail.com>`,

      // Replace with your email
      to: user.email, // Send the email to the user's email address
      subject: 'Account Deletion Confirmation',
      text: `Hello ${user.firstName},

Your account has been successfully deleted from our system.

If you have any concerns or questions, please contact our support team.

Thank you,
PlanEzy Team`,
    };

    await transporter.sendMail(mailOptions);

    // Delete the user
    await SignupModel.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully. A confirmation email has been sent.' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
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

  if (!tripId || !Array.isArray(flightDetails) || flightDetails.length === 0) {
    return res.status(400).json({ error: 'Trip ID and an array of flight details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Save each flight detail and store their IDs
    const savedFlights = await Promise.all(
      flightDetails.map(async (flight) => {
        const newFlight = new FlightModel({ ...flight });
        await newFlight.save();
        return newFlight._id; // Return the saved flight's ID
      })
    );

    // Update the trip's flightDetails array
    trip.flightDetails = [...trip.flightDetails, ...savedFlights];
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

if (!tripId || !Array.isArray(hotelDetails) || hotelDetails.length === 0) {
  return res.status(400).json({ error: 'Trip ID and an array of hotel details are required' });
}

try {
  // Find the trip for the authenticated user
  const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
  }

  // Save each flight detail and store their IDs
  const savedHotel = await Promise.all(
    hotelDetails.map(async (hotel) => {
      const newHotel = new HotelModel({ ...hotel });
      await newHotel.save();
      return newHotel._id; // Return the saved flight's ID
    })
  );

  // Update the trip's hotelDetails array
  trip.hotelDetails = [...trip.hotelDetails, ...savedHotel];
  await trip.save();

  res.json({ message: 'hotel details added to the trip successfully', trip });
} catch (err) {
  console.error("Error adding hotel details: ", err);
  res.status(500).json({ error: 'Error adding hotel details' });
}
});
router.delete('/removeHotelFromTrip', authenticateToken, async (req, res) => {
  const { tripId, hotelIds } = req.body;

  // Validate request body
  if (!tripId || !Array.isArray(hotelIds) || hotelIds.length === 0) {
    return res.status(400).json({ error: 'Trip ID and an array of hotel IDs are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Filter out the hotels to be removed
    trip.hotelDetails = trip.hotelDetails.filter(
      (hotelId) => !hotelIds.includes(hotelId.toString())
    );

    // Save the updated trip
    await trip.save();

    // Optionally, delete the removed hotel documents from the database
    await HotelModel.deleteMany({ _id: { $in: hotelIds } });

    res.json({ message: 'Hotel details removed from the trip successfully', trip });
  } catch (err) {
    console.error('Error removing hotel details: ', err);
    res.status(500).json({ error: 'Error removing hotel details' });
  }
});

//Car 
router.post('/addCarToTrip', authenticateToken, async (req, res) => {
  const { tripId, carDetails } = req.body;

  if (!tripId || !Array.isArray(carDetails) || carDetails.length === 0) {
    return res.status(400).json({ error: 'Trip ID and an array of car details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Save each flight detail and store their IDs
    const savedCar = await Promise.all(
      carDetails.map(async (car) => {
        const newCar = new CarModel({ ...car });
        await newCar.save();
        return newCar._id; // Return the saved flight's ID
      })
    );

    // Update the trip's carDetails array
    trip.carDetails = [...trip.carDetails, ...savedCar];
    await trip.save();

    res.json({ message: 'car details added to the trip successfully', trip });
  } catch (err) {
    console.error("Error adding car details: ", err);
    res.status(500).json({ error: 'Error adding car details' });
  }
  });

//restaurant 
// router.post('/addRestaurantToTrip', authenticateToken, async (req, res) => {
//     const { tripId, restaurantDetails } = req.body;
  

//     if (!tripId || !Array.isArray(restaurantDetails) || restaurantDetails.length === 0) {
//       return res.status(400).json({ error: 'Trip ID and an array of Restaurant details are required' });
//     }
  
//     try {
//       // Find the trip for the authenticated user
//       const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
//       if (!trip) {
//         return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
//       }
  
//       // Save each flight detail and store their IDs
//       const savedRestaurant = await Promise.all(
//         restaurantDetails.map(async (restaurant) => {
//           const newRestaurant = new RestaurantModel({ ...restaurant });
//           await newRestaurant.save();
//           return newRestaurant._id; // Return the saved flight's ID
//         })
//       );
  
//       // Update the trip's restaurantDetails array
//       trip.restaurantDetails = [...trip.restaurantDetails, ...savedRestaurant];
//       await trip.save();
  
//       res.json({ message: 'Restaurant details added to the trip successfully', trip });
//     } catch (err) {
//       console.error("Error adding Restaurant details: ", err);
//       res.status(500).json({ error: 'Error adding Restaurant details' });
//     }
//   });
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
// router.post("/addRestaurantToTrip", async (req, res) => {
//   try {
//       console.log("Request Body:", req.body); // Log the incoming request
//       const { tripId, restaurantDetails } = req.body;

//       if (!tripId || !restaurantDetails) {
//           console.log("Validation Failed: Missing tripId or restaurantDetails");
//           return res.status(400).json({ message: "Invalid data format" });
//       }

//       console.log("Restaurant Details:", restaurantDetails); // Log parsed details

//       const newRestaurant = new RestaurantModel(restaurantDetails);
//       await newRestaurant.save();

//       console.log("Restaurant Saved Successfully:", newRestaurant);
//       res.status(200).json({ message: "Restaurant added successfully", restaurant: newRestaurant });
//   } catch (error) {
//       console.error("Error in /addRestaurantToTrip:", error); // Log error details
//       res.status(500).json({ message: "Internal server error" });
//   }
// });

//Meeting 
router.post('/addMeetingToTrip', authenticateToken, async (req, res) => {
  const { tripId, meetingDetails } = req.body;

  if (!tripId || !Array.isArray(meetingDetails) || meetingDetails.length === 0) {
    return res.status(400).json({ error: 'Trip ID and an array of Meeting details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Save each flight detail and store their IDs
    const savedMeeting = await Promise.all(
      meetingDetails.map(async (meeting) => {
        const newMeeting = new MeetingModel({ ...meeting });
        await newMeeting.save();
        return newMeeting._id; // Return the saved flight's ID
      })
    );

    // Update the trip's meetingDetails array
    trip.meetingDetails = [...trip.meetingDetails, ...savedMeeting];
    await trip.save();

    res.json({ message: 'Meeting details added to the trip successfully', trip });
  } catch (err) {
    console.error("Error adding Meeting details: ", err);
    res.status(500).json({ error: 'Error adding Meeting details' });
  }
});
//Rail
router.post('/addRailToTrip', authenticateToken, async (req, res) => {

  const { tripId, railDetails } = req.body;

  if (!tripId || !Array.isArray(railDetails) || railDetails.length === 0) {
    return res.status(400).json({ error: 'Trip ID and an array of Meeting details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Save each flight detail and store their IDs
    const savedRail = await Promise.all(
      railDetails.map(async (rail) => {
        const newRail = new RailModel({ ...rail });
        await newRail.save();
        return newRail._id; // Return the saved flight's ID
      })
    );

    // Update the trip's railDetails array
    trip.railDetails = [...trip.railDetails, ...savedRail];
    await trip.save();

    res.json({ message: 'Rail details added to the trip successfully', trip });
  } catch (err) {
    console.error("Error adding Rail details: ", err);
    res.status(500).json({ error: 'Error adding Rail details' });
  }
});
//Acitivity
router.post('/addActivityToTrip', authenticateToken, async (req, res) => {
  const { tripId, activityDetails } = req.body;

  if (!tripId || !Array.isArray(activityDetails) || activityDetails.length === 0) {
    return res.status(400).json({ error: 'Trip ID and an array of Meeting details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Save each flight detail and store their IDs
    const savedActivity = await Promise.all(
      activityDetails.map(async (activity) => {
        const newActivity = new ActivityModel({ ...activity });
        await newActivity.save();
        return newActivity._id; // Return the saved flight's ID
      })
    );

    // Update the trip's activityDetails array
    trip.activityDetails = [...trip.activityDetails, ...savedActivity];
    await trip.save();

    res.json({ message: 'Activity details added to the trip successfully', trip });
  } catch (err) {
    console.error("Error adding Activity details: ", err);
    res.status(500).json({ error: 'Error adding Activity details' });
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

router.put('/editFlightInTrip', authenticateToken, async (req, res) => {
  const { tripId, flightId, updatedFlightDetails } = req.body;

  if (!tripId || !flightId || !updatedFlightDetails) {
    return res.status(400).json({ error: 'Trip ID, Flight ID, and updated flight details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the flight ID exists in the trip's flightDetails array
    const flightExists = trip.flightDetails.some(id => id.toString() === flightId);
    if (!flightExists) {
      return res.status(404).json({ error: 'Flight not found in this trip' });
    }

    // Update the flight details in the Flight collection
    const updatedFlight = await FlightModel.findByIdAndUpdate(flightId, updatedFlightDetails, { new: true });
    if (!updatedFlight) {
      return res.status(404).json({ error: 'Flight not found in database' });
    }

    res.json({ message: 'Flight details updated successfully', updatedFlight });
  } catch (err) {
    console.error("Error editing flight details: ", err);
    res.status(500).json({ error: 'Error editing flight details' });
  }
});
router.put('/editCarInTrip', authenticateToken, async (req, res) => {
  const { tripId, carId, updatedCarDetails } = req.body;

  if (!tripId || !carId || !updatedCarDetails) {
    return res.status(400).json({ error: 'Trip ID, Car ID, and updated car details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the car ID exists in the trip's carDetails array
    const carExists = trip.carDetails.some(id => id.toString() === carId);
    if (!carExists) {
      return res.status(404).json({ error: 'Car not found in this trip' });
    }

    // Update the car details in the CarModel
    const updatedCar = await CarModel.findByIdAndUpdate(carId, updatedCarDetails, { new: true });
    if (!updatedCar) {
      return res.status(404).json({ error: 'Car not found in database' });
    }

    res.json({ message: 'Car details updated successfully', updatedCar });
  } catch (err) {
    console.error("Error editing car details: ", err);
    res.status(500).json({ error: 'Error editing car details' });
  }
});
router.put('/editHotelInTrip', authenticateToken, async (req, res) => {
  const { tripId, hotelId, updatedHotelDetails } = req.body;

  if (!tripId || !hotelId || !updatedHotelDetails) {
    return res.status(400).json({ error: 'Trip ID, Hotel ID, and updated hotel details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the hotel ID exists in the trip's hotelDetails array
    const hotelExists = trip.hotelDetails.some(id => id.toString() === hotelId);
    if (!hotelExists) {
      return res.status(404).json({ error: 'Hotel not found in this trip' });
    }

    // Update the hotel details in the Hotel collection
    const updatedHotel = await HotelModel.findByIdAndUpdate(hotelId, updatedHotelDetails, { new: true });
    if (!updatedHotel) {
      return res.status(404).json({ error: 'Hotel not found in database' });
    }

    res.json({ message: 'Hotel details updated successfully', updatedHotel });
  } catch (err) {
    console.error("Error editing hotel details: ", err);
    res.status(500).json({ error: 'Error editing hotel details' });
  }
});
router.put('/editRestaurantInTrip', authenticateToken, async (req, res) => {
  const { tripId, restaurantId, updatedRestaurantDetails } = req.body;

  if (!tripId || !restaurantId || !updatedRestaurantDetails) {
    return res.status(400).json({ error: 'Trip ID, Restaurant ID, and updated restaurant details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the restaurant ID exists in the trip's restaurantDetails array
    const restaurantExists = trip.restaurantDetails.some(id => id.toString() === restaurantId);
    if (!restaurantExists) {
      return res.status(404).json({ error: 'Restaurant not found in this trip' });
    }

    // Update the restaurant details in the Restaurant collection
    const updatedRestaurant = await RestaurantModel.findByIdAndUpdate(
      restaurantId,
      updatedRestaurantDetails,
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found in database' });
    }

    res.json({ message: 'Restaurant details updated successfully', updatedRestaurant });
  } catch (err) {
    console.error("Error editing restaurant details: ", err);
    res.status(500).json({ error: 'Error editing restaurant details' });
  }
});
router.put('/editMeetingInTrip', authenticateToken, async (req, res) => {
  const { tripId, meetingId, updatedMeetingDetails } = req.body;

  if (!tripId || !meetingId || !updatedMeetingDetails) {
    return res.status(400).json({ error: 'Trip ID, Meeting ID, and updated meeting details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the meeting ID exists in the trip's meetingDetails array
    const meetingExists = trip.meetingDetails.some(id => id.toString() === meetingId);
    if (!meetingExists) {
      return res.status(404).json({ error: 'Meeting not found in this trip' });
    }

    // Update the meeting details in the MeetingModel
    const updatedMeeting = await MeetingModel.findByIdAndUpdate(
      meetingId,
      updatedMeetingDetails,
      { new: true }
    );

    if (!updatedMeeting) {
      return res.status(404).json({ error: 'Meeting not found in database' });
    }

    res.json({ message: 'Meeting details updated successfully', updatedMeeting });
  } catch (err) {
    console.error("Error editing meeting details: ", err);
    res.status(500).json({ error: 'Error editing meeting details' });
  }
});
router.put('/editRailInTrip', authenticateToken, async (req, res) => {
  const { tripId, railId, updatedRailDetails } = req.body;

  if (!tripId || !railId || !updatedRailDetails) {
    return res.status(400).json({ error: 'Trip ID, Rail ID, and updated rail details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the rail ID exists in the trip's railDetails array
    const railExists = trip.railDetails.some(id => id.toString() === railId);
    if (!railExists) {
      return res.status(404).json({ error: 'Rail not found in this trip' });
    }

    // Update the rail details in the RailModel
    const updatedRail = await RailModel.findByIdAndUpdate(
      railId,
      updatedRailDetails,
      { new: true }
    );

    if (!updatedRail) {
      return res.status(404).json({ error: 'Rail not found in database' });
    }

    res.json({ message: 'Rail details updated successfully', updatedRail });
  } catch (err) {
    console.error("Error editing rail details: ", err);
    res.status(500).json({ error: 'Error editing rail details' });
  }
});
router.put('/editActivityInTrip', authenticateToken, async (req, res) => {
  const { tripId, activityId, updatedActivityDetails } = req.body;

  if (!tripId || !activityId || !updatedActivityDetails) {
    return res.status(400).json({ error: 'Trip ID, Activity ID, and updated activity details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the activity ID exists in the trip's activityDetails array
    const activityExists = trip.activityDetails.some(id => id.toString() === activityId);
    if (!activityExists) {
      return res.status(404).json({ error: 'Activity not found in this trip' });
    }

    // Update the activity details in the ActivityModel
    const updatedActivity = await ActivityModel.findByIdAndUpdate(
      activityId,
      updatedActivityDetails,
      { new: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({ error: 'Activity not found in database' });
    }

    res.json({ message: 'Activity details updated successfully', updatedActivity });
  } catch (err) {
    console.error("Error editing activity details: ", err);
    res.status(500).json({ error: 'Error editing activity details' });
  }
});


router.delete('/deleteFlightFromTrip', authenticateToken, async (req, res) => {
  const { tripId, flightId } = req.body;

  if (!tripId || !flightId) {
    return res.status(400).json({ error: 'Trip ID and Flight ID are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Remove the flight from the trip's flightDetails array
    trip.flightDetails = trip.flightDetails.filter(id => id.toString() !== flightId);
    await trip.save();

    // Optionally, delete the flight document from the Flight collection
    await FlightModel.findByIdAndDelete(flightId);

    res.json({ message: 'Flight removed from the trip successfully', trip });
  } catch (err) {
    console.error("Error deleting flight: ", err);
    res.status(500).json({ error: 'Error deleting flight' });
  }
});
router.delete('/deleteHotelFromTrip', authenticateToken, async (req, res) => {
  const { tripId, hotelId } = req.body;

  if (!tripId || !hotelId) {
    return res.status(400).json({ error: 'Trip ID and Hotel ID are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Remove the hotel from the trip's hotelDetails array
    trip.hotelDetails = trip.hotelDetails.filter(id => id.toString() !== hotelId);
    await trip.save();

    // Optionally, delete the hotel document from the Hotel collection
    await HotelModel.findByIdAndDelete(hotelId);

    res.json({ message: 'Hotel removed from the trip successfully', trip });
  } catch (err) {
    console.error("Error deleting hotel: ", err);
    res.status(500).json({ error: 'Error deleting hotel' });
  }
});
router.delete('/deleteCarFromTrip', authenticateToken, async (req, res) => {
  const { tripId, carId } = req.body;

  if (!tripId || !carId) {
    return res.status(400).json({ error: 'Trip ID and Car ID are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Remove the car from the trip's carDetails array
    trip.carDetails = trip.carDetails.filter(id => id.toString() !== carId);
    await trip.save();

    // Optionally, delete the car document from the CarModel collection
    await CarModel.findByIdAndDelete(carId);

    res.json({ message: 'Car removed from the trip successfully', trip });
  } catch (err) {
    console.error("Error deleting car: ", err);
    res.status(500).json({ error: 'Error deleting car' });
  }
});
router.delete('/deleteRestaurantFromTrip', authenticateToken, async (req, res) => {
  const { tripId, restaurantId } = req.body;

  if (!tripId || !restaurantId) {
    return res.status(400).json({ error: 'Trip ID and Restaurant ID are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Remove the restaurant from the trip's restaurantDetails array
    trip.restaurantDetails = trip.restaurantDetails.filter(id => id.toString() !== restaurantId);
    await trip.save();

    // Optionally, delete the restaurant document from the Restaurant collection
    await RestaurantModel.findByIdAndDelete(restaurantId);

    res.json({ message: 'Restaurant removed from the trip successfully', trip });
  } catch (err) {
    console.error("Error deleting restaurant: ", err);
    res.status(500).json({ error: 'Error deleting restaurant' });
  }
});

router.delete('/deleteMeetingFromTrip', authenticateToken, async (req, res) => {
  const { tripId, meetingId } = req.body;

  if (!tripId || !meetingId) {
    return res.status(400).json({ error: 'Trip ID and Meeting ID are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Remove the meeting from the trip's meetingDetails array
    trip.meetingDetails = trip.meetingDetails.filter(id => id.toString() !== meetingId);
    await trip.save();

    // Optionally, delete the meeting document from the MeetingModel collection
    await MeetingModel.findByIdAndDelete(meetingId);

    res.json({ message: 'Meeting removed from the trip successfully', trip });
  } catch (err) {
    console.error("Error deleting meeting: ", err);
    res.status(500).json({ error: 'Error deleting meeting' });
  }
});

router.delete('/deleteRailFromTrip', authenticateToken, async (req, res) => {
  const { tripId, railId } = req.body;

  if (!tripId || !railId) {
    return res.status(400).json({ error: 'Trip ID and Rail ID are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Remove the rail from the trip's railDetails array
    trip.railDetails = trip.railDetails.filter(id => id.toString() !== railId);
    await trip.save();

    // Optionally, delete the rail document from the RailModel collection
    await RailModel.findByIdAndDelete(railId);

    res.json({ message: 'Rail removed from the trip successfully', trip });
  } catch (err) {
    console.error("Error deleting rail: ", err);
    res.status(500).json({ error: 'Error deleting rail' });
  }
});
router.delete('/deleteActivityFromTrip', authenticateToken, async (req, res) => {
  const { tripId, activityId } = req.body;

  if (!tripId || !activityId) {
    return res.status(400).json({ error: 'Trip ID and Activity ID are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Remove the activity from the trip's activityDetails array
    trip.activityDetails = trip.activityDetails.filter(id => id.toString() !== activityId);
    await trip.save();

    // Optionally, delete the activity document from the ActivityModel collection
    await ActivityModel.findByIdAndDelete(activityId);

    res.json({ message: 'Activity removed from the trip successfully', trip });
  } catch (err) {
    console.error("Error deleting activity: ", err);
    res.status(500).json({ error: 'Error deleting activity' });
  }
});
////////////////////////////////////////////////////////////////////////////////

router.delete('/deleteFlightFromTrip/:tripId/:flightId', authenticateToken, async (req, res) => {
  const { tripId, flightId } = req.params;

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the flight ID exists in the trip's flightDetails array
    const flightIndex = trip.flightDetails.indexOf(flightId);
    if (flightIndex === -1) {
      return res.status(404).json({ error: 'Flight not found in this trip' });
    }

    // Remove the flight ID from the flightDetails array
    trip.flightDetails.splice(flightIndex, 1);

    // Save the updated trip
    await trip.save();

    // Optionally, delete the flight record from the FlightModel
    await FlightModel.deleteOne({ _id: flightId });

    res.json({ message: 'Flight removed from trip successfully', trip });
  } catch (err) {
    console.error("Error deleting flight: ", err);
    res.status(500).json({ error: 'Error deleting flight' });
  }
});
router.delete('/deleteHotelFromTrip/:tripId/:hotelId', authenticateToken, async (req, res) => {
  const { tripId, hotelId } = req.params;

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the hotel ID exists in the trip's hotelDetails array
    const hotelIndex = trip.hotelDetails.indexOf(hotelId);
    if (hotelIndex === -1) {
      return res.status(404).json({ error: 'Hotel not found in this trip' });
    }

    // Remove the hotel ID from the hotelDetails array
    trip.hotelDetails.splice(hotelIndex, 1);

    // Save the updated trip
    await trip.save();

    // Optionally, delete the hotel record from the HotelModel
    await HotelModel.deleteOne({ _id: hotelId });

    res.json({ message: 'Hotel removed from trip successfully', trip });
  } catch (err) {
    console.error("Error deleting hotel: ", err);
    res.status(500).json({ error: 'Error deleting hotel' });
  }
});
router.delete('/deleteCarFromTrip/:tripId/:carId', authenticateToken, async (req, res) => {
  const { tripId, carId } = req.params;

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the car ID exists in the trip's carDetails array
    const carIndex = trip.carDetails.indexOf(carId);
    if (carIndex === -1) {
      return res.status(404).json({ error: 'Car not found in this trip' });
    }

    // Remove the car ID from the carDetails array
    trip.carDetails.splice(carIndex, 1);

    // Save the updated trip
    await trip.save();

    // Optionally, delete the car record from the CarModel
    await CarModel.deleteOne({ _id: carId });

    res.json({ message: 'Car removed from trip successfully', trip });
  } catch (err) {
    console.error("Error deleting car: ", err);
    res.status(500).json({ error: 'Error deleting car' });
  }
});
router.delete('/deleteRestaurantFromTrip/:tripId/:restaurantId', authenticateToken, async (req, res) => {
  const { tripId, restaurantId } = req.params;

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the restaurant ID exists in the trip's restaurantDetails array
    const restaurantIndex = trip.restaurantDetails.indexOf(restaurantId);
    if (restaurantIndex === -1) {
      return res.status(404).json({ error: 'Restaurant not found in this trip' });
    }

    // Remove the restaurant ID from the restaurantDetails array
    trip.restaurantDetails.splice(restaurantIndex, 1);

    // Save the updated trip
    await trip.save();

    // Optionally, delete the restaurant record from the RestaurantModel
    await RestaurantModel.deleteOne({ _id: restaurantId });

    res.json({ message: 'Restaurant removed from trip successfully', trip });
  } catch (err) {
    console.error("Error deleting restaurant: ", err);
    res.status(500).json({ error: 'Error deleting restaurant' });
  }
});
router.delete('/deleteMeetingFromTrip/:tripId/:meetingId', authenticateToken, async (req, res) => {
  const { tripId, meetingId } = req.params;

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the meeting ID exists in the trip's meetingDetails array
    const meetingIndex = trip.meetingDetails.indexOf(meetingId);
    if (meetingIndex === -1) {
      return res.status(404).json({ error: 'Meeting not found in this trip' });
    }

    // Remove the meeting ID from the meetingDetails array
    trip.meetingDetails.splice(meetingIndex, 1);

    // Save the updated trip
    await trip.save();

    // Optionally, delete the meeting document from the MeetingModel
    await MeetingModel.deleteOne({ _id: meetingId });

    res.json({ message: 'Meeting removed from trip successfully', trip });
  } catch (err) {
    console.error("Error deleting meeting: ", err);
    res.status(500).json({ error: 'Error deleting meeting' });
  }
});
router.delete('/deleteRailFromTrip/:tripId/:railId', authenticateToken, async (req, res) => {
  const { tripId, railId } = req.params;

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the rail ID exists in the trip's railDetails array
    const railIndex = trip.railDetails.indexOf(railId);
    if (railIndex === -1) {
      return res.status(404).json({ error: 'Rail detail not found in this trip' });
    }

    // Remove the rail ID from the railDetails array
    trip.railDetails.splice(railIndex, 1);

    // Save the updated trip
    await trip.save();

    // Optionally, delete the rail record from the RailModel
    await RailModel.deleteOne({ _id: railId });

    res.json({ message: 'Rail detail removed from trip successfully', trip });
  } catch (err) {
    console.error("Error deleting rail detail: ", err);
    res.status(500).json({ error: 'Error deleting rail detail' });
  }
});
router.delete('/deleteActivityFromTrip/:tripId/:activityId', authenticateToken, async (req, res) => {
  const { tripId, activityId } = req.params;

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the activity ID exists in the trip's activityDetails array
    const activityIndex = trip.activityDetails.indexOf(activityId);
    if (activityIndex === -1) {
      return res.status(404).json({ error: 'Activity not found in this trip' });
    }

    // Remove the activity ID from the activityDetails array
    trip.activityDetails.splice(activityIndex, 1);

    // Save the updated trip
    await trip.save();

    // Optionally, delete the activity record from the ActivityModel
    await ActivityModel.deleteOne({ _id: activityId });

    res.json({ message: 'Activity removed from trip successfully', trip });
  } catch (err) {
    console.error("Error deleting activity: ", err);
    res.status(500).json({ error: 'Error deleting activity' });
  }
});


router.put('/editFlightInTrip/:tripId/:flightId', authenticateToken, async (req, res) => {
  const { tripId, flightId } = req.params;
  const updatedFlightDetails = req.body;

  if (!updatedFlightDetails || Object.keys(updatedFlightDetails).length === 0) {
    return res.status(400).json({ error: 'Updated flight details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the flight ID exists in the trip's flightDetails array
    if (!trip.flightDetails.includes(flightId)) {
      return res.status(404).json({ error: 'Flight not found in this trip' });
    }

    // Find and update the flight in the FlightModel collection
    const flight = await FlightModel.findByIdAndUpdate(flightId, updatedFlightDetails, { new: true });
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found in the database' });
    }

    res.json({ message: 'Flight details updated successfully', flight });
  } catch (err) {
    console.error("Error editing flight: ", err);
    res.status(500).json({ error: 'Error editing flight' });
  }
});
router.put('/editHotelInTrip/:tripId/:hotelId', authenticateToken, async (req, res) => {
  const { tripId, hotelId } = req.params;
  const updatedHotelDetails = req.body;

  if (!updatedHotelDetails || Object.keys(updatedHotelDetails).length === 0) {
    return res.status(400).json({ error: 'Updated hotel details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the hotel ID exists in the trip's hotelDetails array
    if (!trip.hotelDetails.includes(hotelId)) {
      return res.status(404).json({ error: 'Hotel not found in this trip' });
    }

    // Find and update the hotel in the HotelModel collection
    const hotel = await HotelModel.findByIdAndUpdate(hotelId, updatedHotelDetails, { new: true });
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found in the database' });
    }

    res.json({ message: 'Hotel details updated successfully', hotel });
  } catch (err) {
    console.error("Error editing hotel: ", err);
    res.status(500).json({ error: 'Error editing hotel' });
  }
});
router.put('/editCarInTrip/:tripId/:carId', authenticateToken, async (req, res) => {
  const { tripId, carId } = req.params;
  const updatedCarDetails = req.body;

  if (!updatedCarDetails || Object.keys(updatedCarDetails).length === 0) {
    return res.status(400).json({ error: 'Updated car details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the car ID exists in the trip's carDetails array
    if (!trip.carDetails.includes(carId)) {
      return res.status(404).json({ error: 'Car not found in this trip' });
    }

    // Find and update the car in the CarModel collection
    const car = await CarModel.findByIdAndUpdate(carId, updatedCarDetails, { new: true });
    if (!car) {
      return res.status(404).json({ error: 'Car not found in the database' });
    }

    res.json({ message: 'Car details updated successfully', car });
  } catch (err) {
    console.error("Error editing car: ", err);
    res.status(500).json({ error: 'Error editing car' });
  }
});
router.put('/editRestaurantInTrip/:tripId/:restaurantId', authenticateToken, async (req, res) => {
  const { tripId, restaurantId } = req.params;
  const updatedRestaurantDetails = req.body;

  if (!updatedRestaurantDetails || Object.keys(updatedRestaurantDetails).length === 0) {
    return res.status(400).json({ error: 'Updated restaurant details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the restaurant ID exists in the trip's restaurantDetails array
    if (!trip.restaurantDetails.includes(restaurantId)) {
      return res.status(404).json({ error: 'Restaurant not found in this trip' });
    }

    // Find and update the restaurant in the RestaurantModel collection
    const restaurant = await RestaurantModel.findByIdAndUpdate(
      restaurantId,
      updatedRestaurantDetails,
      { new: true }
    );
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found in the database' });
    }

    res.json({ message: 'Restaurant details updated successfully', restaurant });
  } catch (err) {
    console.error("Error editing restaurant: ", err);
    res.status(500).json({ error: 'Error editing restaurant' });
  }
});
router.put('/editMeetingInTrip/:tripId/:meetingId', authenticateToken, async (req, res) => {
  const { tripId, meetingId } = req.params;
  const updatedMeetingDetails = req.body;

  if (!updatedMeetingDetails || Object.keys(updatedMeetingDetails).length === 0) {
    return res.status(400).json({ error: 'Updated meeting details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the meeting ID exists in the trip's meetingDetails array
    if (!trip.meetingDetails.includes(meetingId)) {
      return res.status(404).json({ error: 'Meeting not found in this trip' });
    }

    // Find and update the meeting in the MeetingModel collection
    const meeting = await MeetingModel.findByIdAndUpdate(meetingId, updatedMeetingDetails, { new: true });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found in the database' });
    }

    res.json({ message: 'Meeting details updated successfully', meeting });
  } catch (err) {
    console.error("Error editing meeting: ", err);
    res.status(500).json({ error: 'Error editing meeting' });
  }
});
router.put('/editRailInTrip/:tripId/:railId', authenticateToken, async (req, res) => {
  const { tripId, railId } = req.params;
  const updatedRailDetails = req.body;

  // Check if the required fields are present
  if (!updatedRailDetails || Object.keys(updatedRailDetails).length === 0) {
    return res.status(400).json({ error: 'Updated rail details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the rail ID exists in the trip's railDetails array
    const railIndex = trip.railDetails.indexOf(railId);
    if (railIndex === -1) {
      return res.status(404).json({ error: 'Rail detail not found in this trip' });
    }

    // Find and update the rail in the RailModel collection
    const rail = await RailModel.findByIdAndUpdate(railId, updatedRailDetails, { new: true });
    if (!rail) {
      return res.status(404).json({ error: 'Rail detail not found in the database' });
    }

    // Return the updated trip and rail details
    res.json({ message: 'Rail details updated successfully', rail });
  } catch (err) {
    console.error("Error editing rail detail: ", err);
    res.status(500).json({ error: 'Error editing rail detail' });
  }
});
router.put('/editActivityInTrip/:tripId/:activityId', authenticateToken, async (req, res) => {
  const { tripId, activityId } = req.params;
  const updatedActivityDetails = req.body;

  if (!updatedActivityDetails || Object.keys(updatedActivityDetails).length === 0) {
    return res.status(400).json({ error: 'Updated activity details are required' });
  }

  try {
    // Find the trip for the authenticated user
    const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
    }

    // Check if the activity ID exists in the trip's activityDetails array
    if (!trip.activityDetails.includes(activityId)) {
      return res.status(404).json({ error: 'Activity not found in this trip' });
    }

    // Find and update the activity in the ActivityModel collection
    const updatedActivity = await ActivityModel.findByIdAndUpdate(activityId, updatedActivityDetails, { new: true });
    if (!updatedActivity) {
      return res.status(404).json({ error: 'Activity not found in the database' });
    }

    res.json({ message: 'Activity details updated successfully', activity: updatedActivity });
  } catch (err) {
    console.error("Error editing activity: ", err);
    res.status(500).json({ error: 'Error editing activity' });
  }
});


module.exports = router;
