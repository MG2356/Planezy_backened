// const mongoose=require('mongoose')
// const TripSchema = new mongoose.Schema({
//     TripName: String,
//     TripStartDate: Date,
//     TripEndDate: Date,
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Reference to User

  
//   });
// const TripModel=mongoose.model("Trip",TripSchema)
// module.exports=TripModel



const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  TripName: String,
  TripStartDate: Date,
  TripEndDate: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup' },  // Reference to User
  flightDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
  hotelDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  carDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  restaurantDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  meetingDetails:{ type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
  railDetails:{ type: mongoose.Schema.Types.ObjectId, ref: 'Rail' },
  activityDetails:{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }

});

const TripModel = mongoose.model("Trip", TripSchema);
module.exports = TripModel;

