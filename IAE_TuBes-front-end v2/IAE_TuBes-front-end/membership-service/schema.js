// user-service/schema.js

const { gql } = require('apollo-server');

// Definisi Tipe Data (Entities)
// @key(fields: "id") menandakan ID ini dapat digunakan oleh layanan lain untuk referensi
const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type User @key(fields: "id") {
    id: ID!
    email: String!
    fullName: String!
    phoneNumber: String
    createdAt: String!
  }

  extend type Query {
    # Query untuk mengambil user berdasarkan ID
    getUser(id: ID!): User
    # Query untuk mengambil daftar user
    listUsers(limit: Int, offset: Int): [User!]
  }

  extend type Mutation {
    # Mutation untuk registrasi user
    registerUser(email: String!, password: String!, fullName: String!, phoneNumber: String): User!
  }
`;

module.exports = typeDefs;