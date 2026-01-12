const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Promo = sequelize.define('Promo', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ACTIVE' // ACTIVE, EXPIRED
  }
});

module.exports = Promo;