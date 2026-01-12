import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // 1. Ambil token dari LocalStorage
  const token = localStorage.getItem('token');
  
  // DEBUG: Cek di Console Browser apakah tokennya terbaca?
  console.log("🔑 Token saat ini:", token ? token.substring(0, 10) + "..." : "KOSONG/NULL");

  // 2. Kembalikan headers dengan format "Bearer <token>"
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "", 
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default client;