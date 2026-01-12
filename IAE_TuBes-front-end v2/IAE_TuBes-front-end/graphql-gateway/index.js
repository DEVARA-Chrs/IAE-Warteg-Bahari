// graphql-gateway/index.js
const { ApolloServer } = require('apollo-server');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const jwt = require('jsonwebtoken');

// Kelas Custom untuk meneruskan Header Authentication
class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    // Jika di Gateway sudah berhasil decode user, kirim ID-nya ke service bawahan
    if (context.userId) {
      request.http.headers.set('user-id', context.userId);
    }
  }
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'membership', url: 'http://membership-service:4000' },
      { name: 'hotel', url: 'http://hotel-service:4000' },
      { name: 'booking', url: 'http://booking-service:4000' },
      { name: 'payment', url: 'http://payment-service:4000' },
      { name: 'promo', url: 'http://promo-service:4000' },
    ],
  }),
  buildService({ name, url }) {
    return new AuthenticatedDataSource({ url });
  },
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  // Context Gateway: Cek Token di sini!
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    if (token) {
      try {
        // Hapus 'Bearer ' jika ada
        const actualToken = token.replace('Bearer ', '');
        const decoded = jwt.verify(actualToken, "RAHASIA_NEGARA"); // Samakan secret key
        return { userId: decoded.id };
      } catch (e) {
        // Token tidak valid, biarkan saja (mungkin user tamu)
      }
    }
  }
});

server.listen({ port: 4000, host: '0.0.0.0' }).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});