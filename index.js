const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const cors = require("cors");
const SignupModel = require("./Schema/Signup");
const PlaceModel = require("./Schema/Place");
const CommunityModel = require("./Schema/Community");
const TrendingPlaceModel = require("./Schema/TrendingPlace");
const RecommendedPlaceModel = require("./Schema/RecommendedPlace");
const TripModel = require("./Schema/Trip");
const tripRoutes = require("./tripRoutes");
const ContactModel=require("./Schema/ContactSupport")
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
const SECRET_KEY = "your_secret_key";
app.use(cors({ origin: "*", credentials: true, optionSuccessStatus: 200 }));
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://munishgoel45698:9r3jwSuO1CzegsfD@cluster0.9r9br1c.mongodb.net/PlanEzy",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Error connecting to DB:", err));

app.get("/", (req, res) => res.send("Website Working"));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email app password
  },
});


//fav

const PlaceSchema = new mongoose.Schema({
  RecommendedPlaceImage: String,
  RecommendedPlaceName: String,
  RecommendedPlaceAddress: String,
  RecommendedPlaceDescription: String,
  RecommendedPlaceCategory: String,
  RecommendedPlaceRating: Number,
});

const RecentlyViewedModel = mongoose.model('RecentlyViewed', PlaceSchema);
const FavoriteModel = mongoose.model('Favorite', PlaceSchema);;

// POST API to Save Favorite Place
// Save Recently Viewed
app.post('/saveRecentlyViewed', async (req, res) => {
  try {
      const recentlyViewed = new RecentlyViewedModel(req.body);
      await recentlyViewed.save();
      res.status(201).json({ message: 'Recently viewed place saved successfully!' });
  } catch (error) {
      console.error("Error saving recently viewed:", error);
      res.status(500).json({ message: 'Error saving recently viewed place', error });
  }
});

// Save to Favorites
app.post('/saveFavorite', async (req, res) => {
  try {
      const favorite = new FavoriteModel(req.body);
      await favorite.save();
      res.status(201).json({ message: 'Favorite place saved successfully!' });
  } catch (error) {
      console.error("Error saving favorite:", error);
      res.status(500).json({ message: 'Error saving favorite place', error });
  }
});







// User registration
// app.post("/Register", async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const user = new SignupModel({ ...req.body, password: hashedPassword });
//     await user.save();
//     res.status(201).json({ message: "User created successfully" });
//   } catch (err) {
//     console.error("Error during user signup:", err);
//     res.status(500).json({ error: "User signup failed" });
//   }
// });

// // User login with OTP
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await SignupModel.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate a 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     // Send OTP via email
//     const mailOptions = {
//       from: process.env.EMAIL,
//       to: email,
//       subject: "Your OTP for Login",
//       text: `Your OTP for login is: ${otp}. It will expire in 10 minutes.`,
//     };

//     transporter.sendMail(mailOptions, async (err, info) => {
//       if (err) {
//         console.error("Error sending OTP email:", err);
//         return res.status(500).json({ message: "Error sending OTP email" });
//       }

//       console.log("OTP email sent:", info.response);

//       // Save the OTP in the database
//       user.otp = otp;
//       user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
//       await user.save();

//       res.json({ message: "OTP sent successfully" });
//     });
//   } catch (err) {
//     console.error("Error during user login:", err);
//     res.status(500).json({ error: "User login failed" });
//   }
// });
// User Registration
app.post('/Register',async (req, res) => {
  try {
    const user = new SignupModel(req.body);
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error during user signup:", err);
    res.status(500).json({ error: "User signup failed" });
  }
});
app.post("/Login", async(req, res) => {
  const { email, password } = req.body;
  try {
    const user = await SignupModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error("Error during user login:", err);
    res.status(500).json({ error: "User login failed" });
  }
});

// User Login with OTP
app.post("/mglogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await SignupModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: " Your OTP for Login",
      text: `
         
    Dear User,

    This is your One-Time Password (OTP) for login:${otp}

    Please do not share this OTP with anyone.
    It will expire in 5 minutes.

    Note: This is an auto-generated email. Please do not reply to this message.

    Thank you for using our App
    PlanEzy Team
    Happy Planning 😊
      `,
    };

    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.error("Error sending OTP email:", err);
        return res.status(500).json({ message: "Error sending OTP email" });
      }

      console.log("OTP email sent:", info.response);

      // Save OTP and expiration in the user document
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
      await user.save();

      res.json({ message: "OTP sent successfully" });
    });
  } catch (err) {
    console.error("Error during user login:", err);
    res.status(500).json({ error: "User login failed" });
  }
});


// Verify OTP
// app.post("/verify-otp", async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await SignupModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (!user.otp || user.otpExpires < Date.now()) {
//       return res.status(400).json({ message: "OTP expired or not found" });
//     }

//     if (user.otp !== otp) {
//       return res.status(401).json({ message: "Invalid OTP" });
//     }

//     // Clear OTP after successful verification
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     // Generate JWT token
//     const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
//     res.json({ message: "OTP verified successfully", token });
//   } catch (err) {
//     console.error("Error during OTP verification:", err);
//     res.status(500).json({ error: "OTP verification failed" });
//   }
// });
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await SignupModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is expired or invalid
    if (!user.otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });

    // Include the user's name in the response
    const responseData = {
      message: "OTP verified successfully",
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,

      },
    };

    res.json(responseData);
  } catch (err) {
    console.error("Error during OTP verification:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// Other routes...
// Add Place
app.post("/addplace", async (req, res) => {
  try {
    const place = await PlaceModel.create(req.body);
    res.json({ place });
  } catch (err) {
    console.error("Error during adding the place:", err);
    res.status(500).json({ error: "Adding place failed" });
  }
});
app.post('/addtrendingplace', (req, res) => {
  TrendingPlaceModel.create(req.body)
    .then(trendingplace => {
      res.json({ trendingplace });
    })
    .catch(err => {
      console.log("Error during adding the place: ", err);
    });
});

  // app.use('/trip', tripRoutes);


// craete recommended trip
app.post('/addRecommendedTrip', (req, res) => {
  RecommendedPlaceModel.create(req.body)
    .then(recommendedplace => {
      res.json({ recommendedplace });
    })
    .catch(err => {
      console.log("Error during adding the place: ", err);
    });
});


// app.delete('/deleteTrip/:tripId', authenticateToken, async (req, res) => {
//   const { tripId } = req.params;

//   try {
//     // Validate Trip ID format
//     if (!mongoose.Types.ObjectId.isValid(tripId)) {
//       return res.status(400).json({ error: 'Invalid Trip ID format' });
//     }

//     // Find the trip by ID and ensure it belongs to the authenticated user
//     const trip = await TripModel.findOne({ _id: tripId, userId: req.userId });

//     if (!trip) {
//       return res.status(404).json({ error: 'Trip not found or does not belong to this user' });
//     }

//     // Delete associated itinerary details
//     const deletePromises = [];
//     if (trip.flightDetails) deletePromises.push(FlightModel.findByIdAndDelete(trip.flightDetails));
//     if (trip.carDetails) deletePromises.push(CarModel.findByIdAndDelete(trip.carDetails));
//     if (trip.hotelDetails) deletePromises.push(HotelModel.findByIdAndDelete(trip.hotelDetails));
//     if (trip.restaurantDetails) deletePromises.push(RestaurantModel.findByIdAndDelete(trip.restaurantDetails));
//     if (trip.meetingDetails) deletePromises.push(MeetingModel.findByIdAndDelete(trip.meetingDetails));
//     if (trip.railDetails) deletePromises.push(RailModel.findByIdAndDelete(trip.railDetails));
//     if (trip.activityDetails) deletePromises.push(ActivityModel.findByIdAndDelete(trip.activityDetails));

//     await Promise.all(deletePromises);

//     // Delete the trip itself
//     await TripModel.findByIdAndDelete(tripId);

//     res.json({ message: 'Trip and associated details deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting trip:', err);
//     res.status(500).json({ error: 'Error deleting trip' });
//   }
// });







//community post
app.post('/createPost', (req, res) => {
  CommunityModel.create(req.body)
    .then(CommunityData => {
      res.json({ CommunityData });
    })
    .catch(err => {
      console.log("Error during adding the place: ", err);
    });
});
//support
// app.post('/contact',async (req, res) => {
//   try {
//     const contact = new ContactModel(req.body);
//     await contact.save();
//     res.status(201).json({ message: " Submitted successfully" });
//   } catch (err) {
//     console.error("Error during user signup:", err);
//     res.status(500).json({ error: "Not Submitted" });
//   }
// });


// Function to send email

const sendThankYouEmail = (userEmail, userName) => {
  const mailOptions = {
    from: 'planezyalerts@gmail.com', // Replace with your email address
    to: userEmail,
    subject: `Thank you for contacting us, ${userName}!`,
    subject: `Thank you for contacting us, ${userName}!`,
    text: `Dear ${userName},\n\nThank you for reaching out to us. We have received your message and will get back to you soon. We appreciate your interest and look forward to assisting you.\n\nBest regards,\nPlanEzy Team`,
  };

  // Send email using Nodemailer transport
  return transporter.sendMail(mailOptions);
};

app.post('/contact', async (req, res) => {
  try {
    // Save the contact data into the MongoDB database
    const contact = new ContactModel(req.body);
    await contact.save();

    // Send a thank you email to the user
    await sendThankYouEmail(req.body.Email, req.body.FullName);

    // Respond with a success message
    res.status(201).json({ message: 'Submitted successfully, thank you!' });
  } catch (err) {
    console.error('Error during submission:', err);
    res.status(500).json({ error: 'Submission failed, please try again.' });
  }
});
// Update place by ID
app.put('/updateplace/:id', (req, res) => {
  const { id } = req.params;
  PlaceModel.findByIdAndUpdate(id, req.body, { new: true })
    .then(updatedplace => {
      if (!updatedplace) {
        return res.status(404).json({ message: "place not found" });
      }
      res.json({ updatedplace });
    })
    .catch(err => {
      console.log("Error during updating the place: ", err);
      res.status(500).json({ error: "Updating place failed" });
    });
});
// Delete place by ID
app.delete('/deleteplace/:id', (req, res) => {
  const { id } = req.params;
  PlaceModel.findByIdAndDelete(id)
    .then(deletedplace => {
      if (!deletedplace) {
        return res.status(404).json({ message: "place not found" });
      }
      res.json({ message: "place deleted successfully" });
    })
    .catch(err => {
      console.log("Error during deleting the place: ", err);
      res.status(500).json({ error: "Deleting place failed" });
    });
});


// Get Places
app.get("/getcommunity", async (req, res) => {
  try {
    const community = await CommunityModel.find({}).sort("-date");
    res.json(community);
  } catch (err) {
    res.status(500).json(err);
  }
});
app.get("/getplace", async (req, res) => {
  try {
    const places = await PlaceModel.find({}).sort("-date");
    res.json(places);
  } catch (err) {
    res.status(500).json(err);
  }
});
app.get('/getrecommended' ,(req,res)=>{
  RecommendedPlaceModel.find({}).sort('-date') 
  .then(place => res.json(place))
  .catch(err=>res.json(err))

})
//get the trending places
app.get('/gettrendingplace' ,(req,res)=>{
  TrendingPlaceModel.find({}).sort('-date') 
  .then(place => res.json(place))
  .catch(err=>res.json(err))

})
// app.get('/getUser', (req, res) => {
//   SignupModel.find({}).sort('-date') 

//   .then(Signup => res.json(Signup))
//   .catch(err=>res.json(err));
// });
app.get('/getUser', (req, res) => {
  const userEmail = req.headers['user-email'];

  if (!userEmail) {
    return res.status(400).json({ error: 'User email is required' });
  }

  // Find the user by email
  SignupModel.findOne({ email: userEmail })
    .then(user => {
      if (user) {
        // Respond with the user data (omit the password for security)
        const userData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        };
        res.json(userData);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => res.status(500).json({ error: 'Internal server error' }));
});
app.get('/recentlyViewed' ,(req,res)=>{
  PlaceModel.find({}).sort('-date') 

  .then(place => res.json(place))
  .catch(err=>res.json(err))

})
app.get('/trendingPlace' ,(req,res)=>{
  TrendingPlaceModel.find({}).sort('-date') 

  .then(place => res.json(place))
  .catch(err=>res.json(err))

})
//get community post
app.get('/getpost' ,(req,res)=>{
  CommunityModel.find({}).sort('-date') 
  .then(CommunityData => res.json(CommunityData))
  .catch(err=>res.json(err))
})
app.get('/trip' ,(req,res)=>{
  TripModel.find({}).sort('-date') 

  .then(place => res.json(place))
  .catch(err=>res.json(err))

})
app.get('/place/:id', (req, res) => {
  const { id } = req.params;

  PlaceModel.findById(id)
    .then(place => {
      if (!place) {
        return res.status(404).json({ message: "place not found" });
      }
      res.json({ place });
    }) 
    .catch(err => {
      console.log("Error during fetching the place: ", err);
      res.status(500).json({ error: "Fetching place failed" });
    });
});
app.use('/trip', tripRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
