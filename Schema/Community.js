const mongoose=require('mongoose')

const CommunitySchema=new mongoose.Schema({
   
    placeName: String,
    communityCategory:String,
    visitedLocation: String,
    duration: Number,
    tripExperience: String,
    tripPhotos: [String],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup' }

})
const CommunityModel=mongoose.model("Community",CommunitySchema)
module.exports=CommunityModel