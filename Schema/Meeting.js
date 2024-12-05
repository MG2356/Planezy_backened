const mongoose = require('mongoose');
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const MeetingSchema = new mongoose.Schema({
  meetingName: String,
  meetingLocation: String,
  meetingDate: Date,
  meetingTime: { 
    type: String, 
    required: true, 
    validate: {
      validator: function (v) {
        return timeRegex.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:mm)!`
    }
  }

});

const MeetingModel = mongoose.model("Meeting", MeetingSchema);
module.exports = MeetingModel;
