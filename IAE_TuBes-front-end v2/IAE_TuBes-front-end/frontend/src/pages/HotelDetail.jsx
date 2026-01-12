import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';

// 1. QUERY: Ambil detail 1 hotel berdasarkan ID
const GET_HOTEL_DETAIL = gql`
  query GetHotel($id: ID!) {
    hotel(id: $id) {
      id
      name
      location
      pricePerNight
      rating
      imageUrl
    }
  }
`;

// 2. MUTATION: Booking (Pindah dari halaman Hotels tadi)
const BOOK_HOTEL = gql`
  mutation BookHotel($hotelName: String!, $passengerName: String!) {
    createBooking(
      type: "HOTEL", 
      hotelName: $hotelName, 
      passengerName: $passengerName
    ) {
      id
      status
    }
  }
`;

export default function HotelDetail() {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();

  // Fetch Data Hotel
  const { data, loading, error } = useQuery(GET_HOTEL_DETAIL, {
    variables: { id }
  });

  // Setup Mutation Booking
  const [bookHotel, { loading: booking }] = useMutation(BOOK_HOTEL, {
    onCompleted: () => {
      if(window.confirm("✅ Berhasil Booking! Lanjut ke pembayaran di Dashboard?")) {
        navigate('/dashboard');
      }
    },
    onError: (err) => alert("Gagal Booking: " + err.message)
  });

  const handleBook = () => {
    const passengerName = prompt("Masukkan Nama Tamu:", "Traveler");
    if (passengerName && data && data.hotel) {
      bookHotel({ 
        variables: { 
          hotelName: data.hotel.name, 
          passengerName 
        } 
      });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading hotel details...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error.message}</div>;

  const { hotel } = data;

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      
      {/* HEADER IMAGE */}
      <div className="relative h-[400px] w-full">
        <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
        
        {/* Tombol Back */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/30 backdrop-blur-md p-2 rounded-full hover:bg-white/50 transition-all text-white"
        >
          <span className="material-symbols-outlined block">arrow_back</span>
        </button>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
          <p className="flex items-center gap-2 text-lg opacity-90">
            <span className="material-symbols-outlined text-red-400">location_on</span>
            {hotel.location}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto p-8">
        
        {/* Rating & Price Row */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">star</span> {hotel.rating || 4.5}
            </span>
            <span className="text-slate-400 text-sm">(120 Reviews)</span>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Price per night</p>
            <p className="text-3xl font-bold text-blue-600">Rp {hotel.pricePerNight.toLocaleString()}</p>
          </div>
        </div>

        {/* Description (Hardcode Dummy untuk visual) */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-3">About this hotel</h3>
          <p className="text-slate-500 leading-relaxed">
            Rasakan kenyamanan menginap di {hotel.name} yang terletak strategis di jantung kota {hotel.location}. 
            Hotel ini menawarkan pemandangan menakjubkan, layanan kamar 24 jam, dan akses mudah ke berbagai destinasi wisata.
            Cocok untuk liburan keluarga maupun perjalanan bisnis Anda. Kamar yang luas, bersih, dan desain modern siap memanjakan istirahat Anda.
          </p>
        </div>

        {/* Facilities (Dummy Icons) */}
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-4">Facilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Free Wifi", "Swimming Pool", "Restaurant", "Gym", "24h Service", "Parking", "Spa", "AC"].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                <span className="material-symbols-outlined text-blue-500">check_circle</span>
                <span className="font-medium text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FLOATING ACTION BUTTON (Mobile Style) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-2xl flex justify-center">
        <button 
          onClick={handleBook}
          disabled={booking}
          className="bg-blue-600 text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all w-full max-w-md flex justify-center items-center gap-2"
        >
          {booking ? "Processing..." : "Book Room Now"}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

    </div>
  );
}