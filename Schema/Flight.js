const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  airline: String,
  flightNumber: String,
  departureLocation: String,
  arrivalLocation: String,
  departureTime: Date,
  arrivalTime: Date
});

const FlightModel = mongoose.model("Flight", FlightSchema);
module.exports = FlightModel;
