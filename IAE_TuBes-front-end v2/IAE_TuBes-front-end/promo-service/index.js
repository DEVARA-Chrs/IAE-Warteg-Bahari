const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { connectDB } = require('./db');
const Promo = require('./models/Promo');

connectDB();

const typeDefs = gql`
  type Promo @key(fields: "code") {
    id: ID!
    code: String
    discount: Int
    status: String
  }

  extend type Query {
    # TAMBAHAN: Untuk menampilkan list promo di halaman PromoPage frontend
    promos: [Promo]
    
    # Query lama (untuk validasi saat checkout)
    checkPromo(code: String!): Promo
  }

  extend type Mutation {
    createPromo(code: String!, discount: Int!): Promo
  }
`;

const resolvers = {
  Query: {
    // RESOLVER BARU: Ambil semua promo
    promos: async () => {
      // Ambil semua promo yang statusnya ACTIVE
      return await Promo.findAll({ where: { status: 'ACTIVE' } });
    },

    checkPromo: async (_, { code }) => {
      // Cari promo berdasarkan Kode
      const promo = await Promo.findOne({ where: { code } });
      if (!promo) throw new Error("Kode Promo tidak valid!");
      if (promo.status !== 'ACTIVE') throw new Error("Kode Promo sudah tidak aktif!");
      return promo;
    }
  },
  Mutation: {
    createPromo: async (_, { code, discount }) => {
      return await Promo.create({ 
        code, 
        discount,
        status: 'ACTIVE' // Default status active
      });
    }
  },
  // Reference Resolver (Wajib jika pakai Federation)
  Promo: {
    __resolveReference(ref) {
      return Promo.findOne({ where: { code: ref.code } });
    }
  }
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers })
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Promo Service ready at ${url}`);
});