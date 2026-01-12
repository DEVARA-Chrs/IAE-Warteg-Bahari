const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { connectDB } = require('./db');
const axios = require('axios');
const Payment = require('./models/Payment');

connectDB();

const typeDefs = gql`
  type Payment @key(fields: "id") {
    id: ID!
    bookingId: String
    amount: Int
    status: String
    method: String
  }

  extend type Mutation {
    payBooking(bookingId: String!, amount: Int!, method: String): Payment
  }
`;

const resolvers = {
  Mutation: {
    payBooking: async (_, { bookingId, amount, method }, context) => {
      // 1. Simpan Pembayaran
      const newPayment = await Payment.create({
        bookingId,
        amount,
        method,
        status: 'SUCCESS'
      });

      // 2. Telepon Booking Service
      try {
        // --- PERUBAHAN PENTING DI SINI ---
        // Gunakan nama service "booking-service" dan port internal "4000"
        const BOOKING_SERVICE_URL = 'http://booking-service:4000/graphql'; 

        await axios.post(BOOKING_SERVICE_URL, {
          query: `
            mutation UpdateStatusFromPayment($id: ID!, $status: String!) {
              updateBookingStatus(id: $id, status: $status) {
                id
                status
              }
            }
          `,
          variables: {
            id: bookingId,
            status: "PAID"
          }
        }, {
          headers: { Authorization: context.token || '' }
        });

        console.log(`✅ [Payment] Sukses update Booking ID ${bookingId} jadi PAID`);

      } catch (error) {
        console.error("❌ [Payment] Gagal update status booking:", error.message);
      }

      return newPayment;
    }
  }
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: ({ req }) => ({ token: req.headers.authorization })
});

// --- PERUBAHAN PENTING DI SINI ---
// Harus port 4000, karena di docker-compose tertulis "4004:4000"
server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Payment Service ready at ${url}`);
});