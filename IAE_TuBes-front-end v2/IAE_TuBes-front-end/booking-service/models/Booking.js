const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Booking = sequelize.define('Booking', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Tipe Booking: 'FLIGHT' atau 'HOTEL'
  type: {
    type: DataTypes.STRING,
    defaultValue: 'FLIGHT' 
  },
  // Kalau Pesawat, isi ini:
  flightCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Kalau Hotel, isi ini (KOLOM BARU):
  hotelName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passengerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'BOOKED' // BOOKED, PAID, CANCELLED
  }
});

module.exports = Booking;