const mongoose=require('mongoose')

const TrendingPlaceSchema=new mongoose.Schema({
   TrendingPlaceImage:String,
   TrendingPlaceName:String,
   TrendingPlaceType:String,
   TrendingPlaceDescription:String,
})
const TrendingPlaceModel=mongoose.model("TrendingPlace",TrendingPlaceSchema)
module.exports=TrendingPlaceModel