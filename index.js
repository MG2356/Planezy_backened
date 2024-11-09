const express = require("express");
const mongoose = require('mongoose');
const SignupModel = require("./Schema/Signup");
const PlaceModel = require("./Schema/Place")
const CommunityModel=require("./Schema/Community");
const TrendingPlaceModel=require("./Schema/TrendingPlace")
const RecommendedPlaceModel=require("./Schema/RecommendedPlace")
const TripModel=require("./Schema/Trip")
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT||8000;

const app = express();
dotenv.config();
const SECRET_KEY = 'your_secret_key';

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send('Website Working');
});

// Connect to the database
mongoose.connect('mongodb+srv://munishgoel45698:9r3jwSuO1CzegsfD@cluster0.9r9br1c.mongodb.net/PlanEzy', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("connected to db"))
.catch(err => console.log("Error connecting to db: ", err));

// Routes
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


// User registration
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

// User login
app.post("/login", async(req, res) => {
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
//place add 

app.post('/addplace', (req, res) => {
  PlaceModel.create(req.body)
    .then(place => {
      res.json({ place });
    })
    .catch(err => {
      console.log("Error during adding the place: ", err);
    });
});
//create trending place 

app.post('/addtrendingplace', (req, res) => {
  TrendingPlaceModel.create(req.body)
    .then(trendingplace => {
      res.json({ trendingplace });
    })
    .catch(err => {
      console.log("Error during adding the place: ", err);
    });
});
//create trip
// app.post('/addTrip', (req, res) => {
//   TripModel.create(req.body)
//     .then(tripplace => {
//       res.json({ tripplace });
//     })
//     .catch(err => {
//       console.log("Error during adding the place: ", err);
//     });
// });

app.post('/addTrip', authenticateToken, (req, res) => {
  const tripData = { ...req.body, userId: req.userId };

  TripModel.create(tripData)
    .then(trip => res.json({ trip }))
    .catch(err => {
      console.log("Error during adding the trip: ", err);
      res.status(500).json({ error: 'Error adding trip' });
    });
});
// Get User's Trips Route (Requires Authentication)
app.get('/myTrips', authenticateToken, async (req, res) => {
  try {
    const trips = await TripModel.find({ userId: req.userId });
    res.json({ trips });
  } catch (err) {
    console.error("Error fetching user's trips:", err);
    res.status(500).json({ error: 'Error fetching trips' });
  }
});

// Get User's Name and Created Trips (Requires Authentication)
app.get('/userTrips', authenticateToken, async (req, res) => {
    try {
      // Find the user by ID and populate their trips
      const user = await SignupModel.findById(req.userId).select('firstName lastName');
      const trips = await TripModel.find({ userId: req.userId }).select('TripName TripStartDate TripEndDate');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({
        userName: `${user.firstName} ${user.lastName}`,
        trips: trips
      });
    } catch (err) {
      console.error("Error fetching user's name and trips:", err);
      res.status(500).json({ error: 'Error fetching user data' });
    }
  });

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



// get place
app.get('/getplace' ,(req,res)=>{
  PlaceModel.find({}).sort('-date') 

  .then(place => res.json(place))
  .catch(err=>res.json(err))

})
//get recommended place 
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
app.get('/getUser', (req, res) => {
  SignupModel.find({}).sort('-date') 

  .then(Signup => res.json(Signup))
  .catch(err=>res.json(err));
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
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
