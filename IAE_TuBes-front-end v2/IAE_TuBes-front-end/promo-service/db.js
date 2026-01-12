const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'promo_db',
  process.env.DB_USER || 'user',
  process.env.DB_PASS || 'pass',
  {
    host: process.env.DB_HOST || 'promo-db',
    dialect: 'postgres',
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Promo Service: Terhubung ke PostgreSQL');
    await sequelize.sync(); // Otomatis bikin tabel
  } catch (error) {
    console.error('❌ Promo Service: Gagal konek DB:', error.message);
  }
};

module.exports = { sequelize, connectDB };