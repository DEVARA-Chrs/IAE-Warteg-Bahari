// booking-service/db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'booking_db', // Tambah Default
  process.env.DB_USER || 'user',       // Tambah Default
  process.env.DB_PASS || 'pass',       // Tambah Default
  {
    host: process.env.DB_HOST || 'booking-db', // Tambah Default
    dialect: 'postgres',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Gunakan sequelize.config.database agar log-nya akurat
    console.log(`✅ Booking Service: Terhubung ke PostgreSQL (${sequelize.config.database})`);
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
    // process.exit(1); // Komentari ini agar container tidak restart loop
  }
};

module.exports = { sequelize, connectDB };