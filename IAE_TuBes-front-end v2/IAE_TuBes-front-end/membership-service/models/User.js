// membership-service/models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); // Import koneksi yang sudah kita buat

const User = sequelize.define('User', {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'SILVER'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = User;