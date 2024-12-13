const mongoose = require('mongoose');
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const ActivitySchema = new mongoose.Schema({
    eventName: String,
    venue:String,
    address: String,
    startDate: Date,
    endDate: Date,
    // startTime: String,
    startTime: { 
        type: String, 
        required: true, 
        validate: {
          validator: function (v) {
            return timeRegex.test(v);
          },
          message: props => `${props.value} is not a valid time format (HH:mm)!`
        }
      },
      endTime: { 
        type: String, 
        required: true, 
        validate: {
          validator: function (v) {
            return timeRegex.test(v);
          },
          message: props => `${props.value} is not a valid time format (HH:mm)!`
        }
      },
    //endTime: String,
    description: String,
    organizerName: String,
    organizerContact: Number,
  


});

const ActivityModel = mongoose.model("Activity", ActivitySchema);
module.exports = ActivityModel;
