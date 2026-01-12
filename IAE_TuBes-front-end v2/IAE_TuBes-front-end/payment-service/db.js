// payment-service/db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'payment_db',
  process.env.DB_USER || 'user',
  process.env.DB_PASS || 'pass',
  {
    host: process.env.DB_HOST || 'payment-db',
    dialect: 'postgres',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Payment Service: Terhubung ke PostgreSQL`);
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
  }
};

module.exports = { sequelize, connectDB };