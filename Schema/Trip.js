const mongoose=require('mongoose')
const TripSchema = new mongoose.Schema({
    TripName: String,
    TripStartDate: Date,
    TripEndDate: Date,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Reference to User

  
  });
const TripModel=mongoose.model("Trip",TripSchema)
module.exports=TripModel




