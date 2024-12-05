const mongoose = require('mongoose');
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const RailSchema = new mongoose.Schema({
    trainNumber: String,
    trainName: String,
    raildepartureStation: String,
    railarrivalStation: String,
    railDepartureDate: Date,
    railArrivalDate: Date,
    departureTime: { 
        type: String, 
        required: true, 
        validate: {
          validator: function (v) {
            return timeRegex.test(v);
          },
          message: props => `${props.value} is not a valid time format (HH:mm)!`
        }
      },
      arrivalTime: { 
        type: String, 
        required: true, 
        validate: {
          validator: function (v) {
            return timeRegex.test(v);
          },
          message: props => `${props.value} is not a valid time format (HH:mm)!`
        }
      },

    railclass: String,
    seat:String


});

const RailModel = mongoose.model("Rail", RailSchema);
module.exports = RailModel;
