const mongoose=require('mongoose')

const ContactSchema=new mongoose.Schema({
   
  FullName:String,
  Email:String,
  Phone:Number,
  Message:String


})
const ContactModel=mongoose.model("Contact",ContactSchema)
module.exports=ContactModel