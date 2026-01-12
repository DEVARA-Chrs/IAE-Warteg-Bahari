// hotel-service/index.js
const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');

// 1. Koneksi ke MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://hotel-db:27017/hotel_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Hotel Service: Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 2. Definisi Schema GraphQL
const typeDefs = gql`
  type Hotel @key(fields: "id") {
    id: ID!
    name: String
    location: String
    pricePerNight: Int
    rating: Float
    imageUrl: String
  }

  extend type Query {
    hotels: [Hotel]
    hotel(id: ID!): Hotel
  }

  extend type Mutation {
    addHotel(
      name: String!, 
      location: String!, 
      pricePerNight: Int!, 
      imageUrl: String
    ): Hotel
    
    # Mutasi untuk update
    updateHotel(id: ID!, imageUrl: String!): Hotel
  }
`;

// 3. Resolvers (Logika)
const resolvers = {
  Query: {
    hotels: async () => {
      return await Hotel.find();
    },
    hotel: async (_, { id }) => {
      return await Hotel.findById(id);
    }
  },
  Mutation: {
    addHotel: async (_, args) => {
      const newHotel = new Hotel(args);
      return await newHotel.save();
    }, // <--- INI KOMA YANG HILANG TADI

    updateHotel: async (_, { id, imageUrl }) => {
      // Cari ID hotel dan update gambarnya
      const updatedHotel = await Hotel.findByIdAndUpdate(
        id, 
        { imageUrl }, 
        { new: true } // Opsi ini supaya return data yang SUDAH diupdate
      );
      return updatedHotel;
    }
  }
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers })
});

// Port 4000 (Internal Docker)
server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Hotel Service ready at ${url}`);
});