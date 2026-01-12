// payment-service/models/Payment.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Payment = sequelize.define('Payment', {
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  method: { // Transfer, Kartu Kredit, dll
    type: DataTypes.STRING,
    defaultValue: 'TRANSFER'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'SUCCESS'
  }
});

module.exports = Payment;