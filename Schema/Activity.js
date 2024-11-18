const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    eventName: String,
    venue:String,
    address: String,
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    description: String,
    organizerName: String,
    organizerContact: Number,
  


});

const ActivityModel = mongoose.model("Activity", ActivitySchema);
module.exports = ActivityModel;
