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

// User Login with OTP
app.post("/login", async (req, res) => {
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

Thank you for using 
PlanEzy
(Happy Planning 😊)
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
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await SignupModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
    res.json({ message: "OTP verified successfully", token });
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
