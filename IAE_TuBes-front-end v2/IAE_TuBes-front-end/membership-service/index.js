const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- DATABASE SETUP ---
const sequelize = new Sequelize(
  process.env.DB_NAME || 'membership_db',
  process.env.DB_USER || 'user',
  process.env.DB_PASS || 'pass',
  {
    host: process.env.DB_HOST || 'membership-db',
    dialect: 'postgres',
    logging: false
  }
);

// 1. MODEL USER
const User = sequelize.define('User', {
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  tier: { type: DataTypes.STRING, defaultValue: 'Silver' },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  balance: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'Active' }
});

// 2. MODEL TRANSACTION (BARU!)
const Transaction = sequelize.define('Transaction', {
  type: { type: DataTypes.STRING, allowNull: false }, // 'TOPUP' atau 'PAYMENT'
  amount: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING }, // Misal: "Top Up Wallet" atau "Payment Hotel..."
});

// 3. RELASI (User punya banyak Transaksi)
User.hasMany(Transaction);
Transaction.belongsTo(User);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Bikin tabel Transaction otomatis
    console.log('✅ Membership Service: Connected & Schema Updated');
  } catch (error) {
    console.error('❌ DB Error:', error.message);
  }
};
connectDB();

// --- SCHEMA ---
const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    fullName: String
    email: String
    status: String
    phone: String
    location: String
    tier: String
    points: Int
    balance: Int 
  }

  # Tipe Data Transaksi Baru
  type Transaction {
    id: ID!
    type: String
    amount: Int
    description: String
    createdAt: String
  }

  type AuthPayload {
    token: String
    user: User
  }

  extend type Query {
    me: User
    # Query untuk ambil history
    myTransactions: [Transaction]
  }

  extend type Mutation {
    register(fullName: String!, email: String!, password: String!): User
    login(email: String!, password: String!): AuthPayload
    updateProfile(email: String, fullName: String, phone: String, location: String): User
    
    # Update: TopUp & Pay akan catat history
    topUp(amount: Int!): User
    payWithWallet(amount: Int!, description: String): User
  }
`;

// --- RESOLVERS ---
const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.userId) return null;
      return await User.findByPk(context.userId);
    },
    // Resolver History Transaksi
    myTransactions: async (_, __, context) => {
      if (!context.userId) throw new Error("Unauthorized");
      return await Transaction.findAll({ 
        where: { UserId: context.userId },
        order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
      });
    }
  },
  User: {
    __resolveReference(ref) {
      return User.findByPk(ref.id);
    }
  },
  Mutation: {
    register: async (_, { fullName, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return await User.create({
        fullName,
        email,
        password: hashedPassword,
        tier: 'Silver',
        points: 0,
        balance: 0,
        phone: '-',
        location: '-'
      });
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("User tidak ditemukan");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Password salah");

      const token = jwt.sign({ id: user.id }, "RAHASIA_NEGARA", { expiresIn: '7d' });
      return { token, user };
    },
    updateProfile: async (_, args, context) => {
      if (!context.userId) throw new Error("Unauthorized");
      const user = await User.findByPk(context.userId);
      if (args.email) user.email = args.email;
      if (args.fullName) user.fullName = args.fullName;
      if (args.phone) user.phone = args.phone;
      if (args.location) user.location = args.location;
      await user.save();
      return user;
    },
    
    // UPDATE LOGIKA TOP UP (Catat History)
    topUp: async (_, { amount }, context) => {
      if (!context.userId) throw new Error("Unauthorized");
      const user = await User.findByPk(context.userId);
      
      // 1. Tambah Saldo
      user.balance += amount;
      await user.save();

      // 2. Buat Catatan Transaksi
      await Transaction.create({
        UserId: user.id,
        type: 'TOPUP',
        amount: amount,
        description: 'Wallet Top Up'
      });

      return user;
    },

    // UPDATE LOGIKA PAY (Catat History)
    payWithWallet: async (_, { amount, description }, context) => {
      if (!context.userId) throw new Error("Unauthorized");
      const user = await User.findByPk(context.userId);
      
      if (!user) throw new Error("User tidak ditemukan");
      if (user.balance < amount) throw new Error("Saldo Wallet tidak cukup!");

      // 1. Potong Saldo
      user.balance -= amount;
      await user.save();
      
      // 2. Buat Catatan Transaksi
      await Transaction.create({
        UserId: user.id,
        type: 'PAYMENT',
        amount: amount,
        description: description || 'Payment via Wallet'
      });
      
      return user;
    }
  }
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: ({ req }) => {
    const userId = req.headers['user-id'];
    return { userId };
  }
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Membership Service ready at ${url}`);
});