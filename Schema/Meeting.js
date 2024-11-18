const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  meetingName: String,
  meetingLocation: String,
  meetingDate: Date,
  meetingTime: String,

});

const MeetingModel = mongoose.model("Meeting", MeetingSchema);
module.exports = MeetingModel;
