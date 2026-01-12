const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { connectDB, sequelize } = require('./db');
const Booking = require('./models/Booking');

// ====== Integrasi ke Sistem Maskapai (TUBES js v2.5) ======
// NOTE: nilai default di bawah ini aman untuk local dev,
// tapi untuk lintas laptop wajib di-override via ENV (lihat README integrasi).
const AIRLINE_FLIGHT_SCHEDULE_SERVICE = process.env.AIRLINE_FLIGHT_SCHEDULE_SERVICE;
const AIRLINE_FLIGHT_BOOKING_SERVICE = process.env.AIRLINE_FLIGHT_BOOKING_SERVICE;
const PARTNER_API_KEY = process.env.PARTNER_API_KEY || 'PARTNER_SECRET';

// === VALIDASI ENV INTEGRASI MASKAPAI ===
if (!AIRLINE_FLIGHT_SCHEDULE_SERVICE || !AIRLINE_FLIGHT_BOOKING_SERVICE) {
  console.error('[booking-service] ENV AIRLINE_FLIGHT_SCHEDULE_SERVICE / AIRLINE_FLIGHT_BOOKING_SERVICE belum di-set.');
  console.error('Isi .env travel-app agar menunjuk ke BASE URL maskapai (LAN/ngrok).');
  process.exit(1);
}

async function postGraphQL(url, query, variables = {}, extraHeaders = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({ query, variables }),
  });

  // Apollo kadang tetap return 200 walau error ada di payload
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} saat memanggil ${url}`);
  }
  if (json.errors && json.errors.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

async function getAirlineFlightByCode(flightCode) {
  const data = await postGraphQL(
    AIRLINE_FLIGHT_SCHEDULE_SERVICE,
    `query ($code: String!) {
      flightByCode(flightCode: $code) {
        id
        flightCode
        price
        availableSeats
        status
        departureLocation
        destinationLocation
        departureTime
        arrivalTime
      }
    }`,
    { code: flightCode }
  );
  return data.flightByCode;
}

// Update Database Structure (Alter Table)
connectDB().then(async () => {
  // Opsi { alter: true } akan otomatis menambah kolom baru (hotelName) ke tabel yang sudah ada
  await sequelize.sync({ alter: true });
});

const typeDefs = gql`
  type Booking @key(fields: "id") {
    id: ID!
    userId: String
    type: String      # Baru
    hotelName: String # Baru
    flightCode: String
    passengerName: String
    status: String
  }

  extend type Mutation {
    # Kita update mutasi ini supaya flightCode jadi opsional (bisa null kalau booking hotel)
    createBooking(
      type: String, 
      flightCode: String, 
      hotelName: String, 
      passengerName: String!
    ): Booking
    
    updateBookingStatus(id: ID!, status: String!): Booking
  }
  
  extend type Query {
    myBookings: [Booking]
    # Untuk integrasi lintas sistem (maskapai dapat ambil data booking travel-app)
    bookingById(id: ID!): Booking

    # Travel-app mengambil data flight schedule dari sistem maskapai
    airlineFlightByCode(flightCode: String!): AirlineFlightSchedule
    airlineFlightSchedules(
      departureLocation: String
      destinationLocation: String
      departureDate: String
    ): [AirlineFlightSchedule]
  }

  type AirlineFlightSchedule {
    id: ID!
    flightCode: String!
    departureLocation: String
    destinationLocation: String
    departureTime: String
    arrivalTime: String
    price: Float
    availableSeats: Int
    status: String
  }
`;

const resolvers = {
  Mutation: {
    createBooking: async (_, args, context) => {
      if (!context.userId) throw new Error("Anda harus login!");
      
      // Default type FLIGHT jika tidak diisi
      const type = args.type || 'FLIGHT';

      // ====== INTEGRASI FLIGHT (ambil schedule dari maskapai, lalu sync booking ke maskapai) ======
      if (type === 'FLIGHT') {
        if (!args.flightCode) throw new Error('flightCode wajib diisi untuk booking FLIGHT');

        // 1) Ambil data jadwal dari maskapai (validasi)
        let flight;
        try {
          flight = await getAirlineFlightByCode(args.flightCode);
        } catch (e) {
          throw new Error(`Flight schedule tidak ditemukan di maskapai: ${e.message}`);
        }

        if (flight.status && flight.status !== 'ACTIVE') {
          throw new Error('Flight tidak aktif di sistem maskapai');
        }
        if (typeof flight.availableSeats === 'number' && flight.availableSeats < 1) {
          throw new Error('Kursi tidak tersedia di sistem maskapai');
        }

        // 2) Buat booking di Travel-app dulu
        const booking = await Booking.create({
          userId: context.userId,
          type,
          flightCode: args.flightCode,
          hotelName: null,
          passengerName: args.passengerName,
          status: 'BOOKED',
        });

        // 3) Trigger sinkronisasi ke maskapai (maskapai akan memanggil balik bookingById)
        try {
          await postGraphQL(
            AIRLINE_FLIGHT_BOOKING_SERVICE,
            `mutation ($bookingId: ID!) {
              syncKelompok2Booking(bookingId: $bookingId) {
                id
                flightCode
                passengerName
                status
                externalBookingId
              }
            }`,
            { bookingId: booking.id },
            { 'x-api-key': PARTNER_API_KEY }
          );
        } catch (e) {
          // Supaya konsisten, kalau gagal sync kita rollback booking travel-app
          await booking.destroy();
          throw new Error(`Gagal sinkronisasi booking ke maskapai: ${e.message}`);
        }

        return booking;
      }

      // ====== HOTEL (tidak perlu integrasi maskapai) ======
      return await Booking.create({
        userId: context.userId,
        type,
        flightCode: null,
        hotelName: args.hotelName,
        passengerName: args.passengerName,
        status: 'BOOKED',
      });
    },

    updateBookingStatus: async (_, { id, status }) => {
      const booking = await Booking.findByPk(id);
      if (!booking) throw new Error("Booking tidak ditemukan");
      booking.status = status;
      await booking.save();
      return booking;
    }
  },
  Query: {
    myBookings: async (_, __, context) => {
      if (!context.userId) throw new Error("Unauthorized");
      return await Booking.findAll({ 
        where: { userId: context.userId },
        order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
      });
    },

    // Untuk integrasi maskapai: ambil booking tertentu tanpa auth.
    // NOTE: sengaja dibuat public supaya sistem maskapai bisa sinkronisasi booking.
    bookingById: async (_, { id }) => {
      const booking = await Booking.findByPk(id);
      if (!booking) throw new Error('Booking tidak ditemukan');
      return booking;
    },

    airlineFlightByCode: async (_, { flightCode }) => {
      return await getAirlineFlightByCode(flightCode);
    },

    airlineFlightSchedules: async (_, { departureLocation, destinationLocation, departureDate }) => {
      const data = await postGraphQL(
        AIRLINE_FLIGHT_SCHEDULE_SERVICE,
        `query ($departureLocation: String, $destinationLocation: String, $departureDate: String) {
          flightSchedules(
            departureLocation: $departureLocation
            destinationLocation: $destinationLocation
            departureDate: $departureDate
          ) {
            id
            flightCode
            departureLocation
            destinationLocation
            departureTime
            arrivalTime
            price
            availableSeats
            status
          }
        }`,
        { departureLocation, destinationLocation, departureDate }
      );
      return data.flightSchedules;
    },
  }
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: ({ req }) => ({ userId: req.headers['user-id'] })
});

server.listen({ port: 4000, host: '0.0.0.0' }).then(({ url }) => {
  console.log(`🚀 Booking Service ready at ${url}`);
});