const express = require("express");
const mongoose = require('mongoose');
const SignupModel = require("./Schema/Signup");
const PlaceModel = require("./Schema/Place")
const TrendingPlaceModel=require("./Schema/TrendingPlace")
const TripModel=require("./Schema/Trip")
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const BASE_URL = process.env.BASE_URL
const PORT = process.env.PORT||8000;

const app = express();
dotenv.config();

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

// User registration
app.post('/Register', (req, res) => {
  SignupModel.create(req.body )
  .then(Signup => res.json(Signup))
  .catch(err=>res.json(err));
});

// User login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  SignupModel.findOne({email:email})

  .then(user =>{

      if(user){
          if(user.password===password){
              res.json("Success")
              // res.json({ success: true });

          }
          else{
              console.log("invalid password is incorrect")
          }
      }
      else{
          console.log("no record found")
      }
  })
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
app.post('/addtrendingplace', (req, res) => {
  TrendingPlaceModel.create(req.body)
    .then(trendingplace => {
      res.json({ trendingplace });
    })
    .catch(err => {
      console.log("Error during adding the place: ", err);
    });
});
app.post('/addTrip', (req, res) => {
  TripModel.create(req.body)
    .then(tripplace => {
      res.json({ tripplace });
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
// get user
app.get('/getplace' ,(req,res)=>{
  PlaceModel.find({}).sort('-date') 

  .then(place => res.json(place))
  .catch(err=>res.json(err))

})
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
