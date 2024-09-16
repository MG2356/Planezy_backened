const mongoose = require('mongoose');

const RecommendedPlaceSchema = new mongoose.Schema({
  RecommendedPlaceName: String,
  RecommendedPlaceAddress: String,
  RecommendedPlaceDescription: String,
  RecommendedPlaceRating: Number
});

module.exports = RecommendedPlaceSchema;