const mongoose=require('mongoose')
const TripSchema = new mongoose.Schema({
    TripName: String,
    TripStartDate: Date,
    TripEndDate: Date

  
  });
const TripModel=mongoose.model("Trip",TripSchema)
module.exports=TripModel

// Define the Trip schema with a reference to the Signup schema

// const TripSchema = new mongoose.Schema({
//   TripName: String,
//   TripStartDate: Date,
//   TripEndDate: Date,
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup' } // Reference to the Signup schema
// });

// const TripModel = mongoose.model("Trip", TripSchema);
// module.exports = TripModel;