const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  restaurantName: String,
  restaurantLocation: String,
  restaurantOpeningTime: Date,
  restaurantClosingTime: Date
});

const RestaurantModel = mongoose.model("Restaurant", RestaurantSchema);
module.exports = RestaurantModel;
