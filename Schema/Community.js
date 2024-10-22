const mongoose=require('mongoose')

const CommunitySchema=new mongoose.Schema({
    placeName: String,
     visitedLocation: String,
     duration: Number,
     tripExperience: String,
     tripPhotos: String
})
const CommunityModel=mongoose.model("Community",CommunitySchema)
module.exports=CommunityModel