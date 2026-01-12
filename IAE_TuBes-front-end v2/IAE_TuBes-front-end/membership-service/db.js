const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'membership_db', // Tambahkan Default
  process.env.DB_USER || 'user',          // Tambahkan Default
  process.env.DB_PASS || 'pass',          // Tambahkan Default
  {
    host: process.env.DB_HOST || 'membership-db', // Penting: Default ke nama host docker
    dialect: 'postgres',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Gunakan nama DB dari config sequelize agar akurat
    console.log(`✅ Membership Service: Terhubung ke PostgreSQL (${sequelize.config.database})`);
    
    // Sync tabel otomatis
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
    // process.exit(1); // <-- DISARANKAN DI-KOMENTARI (Biar container gak mati saat nunggu DB siap)
  }
};

module.exports = { sequelize, connectDB };