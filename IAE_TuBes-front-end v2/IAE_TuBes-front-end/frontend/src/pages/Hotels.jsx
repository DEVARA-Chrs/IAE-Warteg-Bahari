import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_HOTELS = gql`
  query GetHotels {
    hotels {
      id
      name
      location
      pricePerNight
      rating
      imageUrl
    }
  }
`;

// MUTASI BARU: Booking Hotel
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

export default function Hotels() {
  const navigate = useNavigate();
  
  // Ambil nama user dari token (Decode sederhana)
  // Di real app, sebaiknya ambil dari Query User Profile
  const token = localStorage.getItem('token');
  const getUsername = () => "Guest User"; // Placeholder nama

  const { data, loading, error } = useQuery(GET_HOTELS);
  
  const [bookHotel, { loading: booking }] = useMutation(BOOK_HOTEL, {
    onCompleted: () => {
      if(window.confirm("✅ Berhasil Booking Hotel! Mau bayar sekarang di Dashboard?")) {
        navigate('/dashboard');
      }
    },
    onError: (err) => alert("Gagal Booking: " + err.message)
  });

  const handleBook = (hotelName) => {
    // Hardcode nama penumpang dulu biar cepat
    // Kalau mau niat, bisa munculin popup input nama
    const passengerName = prompt("Masukkan Nama Tamu:", "Traveler");
    
    if (passengerName) {
      bookHotel({ variables: { hotelName, passengerName } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="bg-slate-50 min-h-screen flex font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 fixed h-full">
        <div className="flex items-center gap-2 mb-8 text-blue-600 font-bold text-xl">
          <span className="material-symbols-outlined">flight_takeoff</span>
          TravelApp
        </div>
        <nav className="flex flex-col gap-2">
          <div onClick={() => navigate('/home')} className="p-3 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-semibold flex items-center gap-3 cursor-pointer transition-all">
            <span className="material-symbols-outlined">home</span> Home
          </div>
          <div onClick={() => navigate('/dashboard')} className="p-3 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-semibold flex items-center gap-3 cursor-pointer transition-all">
            <span className="material-symbols-outlined">dashboard</span> Dashboard
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg font-semibold flex items-center gap-3 cursor-pointer">
            <span className="material-symbols-outlined">hotel</span> Hotels
          </div>
          <div onClick={() => navigate('/wallet')} className="p-3 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-semibold flex items-center gap-3 cursor-pointer transition-all">
            <span className="material-symbols-outlined">wallet</span> Wallet
          </div>
          <button onClick={handleLogout} className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-3 text-left w-full mt-auto">
            <span className="material-symbols-outlined">logout</span> Logout
          </button>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-8 md:ml-64">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Explore Hotels</h1>
          <p className="text-slate-500">Find your best staycation!</p>
        </header>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error.message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data && data.hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-48 overflow-hidden relative">
                <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                  <span className="text-yellow-500">★</span> {hotel.rating || 4.5}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-800">{hotel.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {hotel.location}
                </p>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400">Price per night</p>
                    <p className="text-blue-600 font-bold text-lg">Rp {hotel.pricePerNight.toLocaleString()}</p>
                  </div>
                  
                  {/* TOMBOL BOOKING */}
                  <button 
                    onClick={() => navigate(`/hotels/${hotel.id}`)} 
                    className="bg-white border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
                    >
                    View Details
                    </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}