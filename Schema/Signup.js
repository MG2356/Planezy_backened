const mongoose=require('mongoose')

const SignupSchema=new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    phoneNumber:String,
    password:String,
})
const SignupModel=mongoose.model("Signup",SignupSchema)
module.exports=SignupModel

// Trip Schema
// const mongoose = require('mongoose');



// // Signup Schema
// const SignupSchema = new mongoose.Schema({
//     firstName: String,
//     lastName: String,
//     email: String,
//     phoneNumber: String,
//     password: String,
//     trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }] // Array to store trip references
// });

// const SignupModel = mongoose.model("Signup", SignupSchema);
// module.exports = SignupModel;
