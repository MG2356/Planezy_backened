const mongoose = require('mongoose');

const RecentlyViewedSchema = new mongoose.Schema({
    userId: String, // Optional: For user-specific functionality
    RecommendedPlaceImage: String,
    RecommendedPlaceName: String,
    RecommendedPlaceAddress: String,
    RecommendedPlaceDescription: String,
    RecommendedPlaceCategory: String,
    RecommendedPlaceRating: Number,
    viewedAt: { type: Date, default: Date.now },
});

// Model for Recently Viewed Place
const RecentlyViewedModel = mongoose.model('RecentlyViewed', RecentlyViewedSchema);