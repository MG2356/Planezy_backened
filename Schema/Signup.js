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