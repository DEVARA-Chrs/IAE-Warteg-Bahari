// hotel-service/models/Hotel.js
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  imageUrl: {
    type: String,
    default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3" // Gambar default cantik
  }
});

module.exports = mongoose.model('Hotel', hotelSchema);