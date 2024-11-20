// const mongoose=require('mongoose')

// const SignupSchema=new mongoose.Schema({
//     firstName:String,
//     lastName:String,
//     email:String,
//     phoneNumber:String,
//     password:String,
// })
// const SignupModel=mongoose.model("Signup",SignupSchema)
// module.exports=SignupModel









// const SignupSchema = new mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   email: { type: String, unique: true },
//   phoneNumber: String,
//   password: String,
//   otp: { type: String, default: null },
//   otpExpires: { type: Date, default: null },
// });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SignupSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  phoneNumber: String,
  otp: String,
  otpExpires: Date,
});
// Hash password before saving user
SignupSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Signup', SignupSchema);










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
