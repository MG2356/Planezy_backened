const mongoose = require('mongoose');

// const RestaurantSchema = new mongoose.Schema({
//   restaurantName: String,
//   restaurantLocation: String,
//   restaurantOpeningTime: Date,
//   restaurantClosingTime: Date
// });


const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const RestaurantSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  restaurantLocation: { type: String, required: true },
  restaurantOpeningTime: { 
    type: String, 
    required: true, 
    validate: {
      validator: function (v) {
        return timeRegex.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:mm)!`
    }
  },
  restaurantClosingTime: { 
    type: String, 
    required: true, 
    validate: {
      validator: function (v) {
        return timeRegex.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:mm)!`
    }
  },
});
const RestaurantModel = mongoose.model("Restaurant", RestaurantSchema);
module.exports = RestaurantModel;