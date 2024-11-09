const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  carModel: String,
  pickUpLocation: String,
  dropOffLocation: String,
  pickupDate: Date,
  dropOffDate: Date
});

const CarModel = mongoose.model("Car", CarSchema);
module.exports = CarModel;
