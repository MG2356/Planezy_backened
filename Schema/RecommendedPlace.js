const mongoose = require('mongoose');

const RecommendedPlaceSchema = new mongoose.Schema({
  RecommendedPlaceName: String,
  RecommendedPlaceAddress: String,
  RecommendedPlaceDescription: String,
  RecommendedPlaceCategory: String,
  RecommendedPlaceRating: Number
});

const RecommendedPlaceModel=mongoose.model("RecommendedPlace",RecommendedPlaceSchema)
module.exports=RecommendedPlaceModel

