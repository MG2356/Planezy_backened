const mongoose=require('mongoose')
const RecommendedPlaceSchema = require('./RecommendedPlace');
const TripSchema = new mongoose.Schema({
    TripName: String,
    TripDate: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
RecommendedPlaces: [RecommendedPlaceSchema]
  });
const TripModel=mongoose.model("Trip",TripSchema)
module.exports=TripModel