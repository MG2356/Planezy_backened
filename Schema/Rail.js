const mongoose = require('mongoose');

const RailSchema = new mongoose.Schema({
    trainNumber: String,
    trainName: String,
    raildepartureStation: String,
    railarrivalStation: String,
    departureTime: Date,
    arrivalTime: Date,
    class: String,
    seat:String


});

const RailModel = mongoose.model("Rail", RailSchema);
module.exports = RailModel;
