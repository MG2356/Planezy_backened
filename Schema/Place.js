const mongoose=require('mongoose')

const PlaceSchema=new mongoose.Schema({
    placeImage:String,
    placeName:String,
    placeType:String,
    placeDescription:String,
})
const PlaceModel=mongoose.model("PlaceDetail",PlaceSchema)
module.exports=PlaceModel