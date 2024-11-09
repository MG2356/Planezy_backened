const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  hotelName: String,
  hotelLocation: String,
  hotelcheckInDate: Date,
  hotelcheckOutDate: Date
});

const HotelModel = mongoose.model("Hotel", HotelSchema);
module.exports = HotelModel;
