import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

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

export default function Hotels() {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_HOTELS);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* --- 1. NAVBAR (Header) --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-600">
            <span className="material-symbols-outlined text-3xl">travel_explore</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">TravelApp</span>
          </div>
          
          <nav className="hidden md:flex gap-8">
            <button onClick={() => navigate('/home')} className="text-blue-600 font-bold border-b-2 border-blue-600">Home</button>
            <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-blue-600 font-medium">Dashboard</button>
            <button onClick={() => navigate('/history')} className="text-slate-500 hover:text-blue-600 font-medium">History</button>
            <button onClick={() => navigate('/wallet')} className="text-slate-500 hover:text-blue-600 font-medium">Wallet</button>
            <button onClick={() => navigate('/promos')} className="text-slate-500 hover:text-blue-600 font-medium">Promos</button>
            <button onClick={() => navigate('/profile')} className="text-slate-500 hover:text-blue-600 font-medium">Profile</button>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-600">Logout</button>
            <div className="size-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      {/* --- 2. HERO SECTION (Foto Besar & Search) --- */}
      <div className="relative w-full bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1571003123894-1a37b8189071?auto=format&fit=crop&w=1600&q=80" 
            alt="Background" 
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:py-32">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
            Find your next stay
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-slate-200 sm:text-xl font-light">
            Discover the best hotels at the best prices around the world.
          </p>

          {/* SEARCH BAR (Visual Only) */}
          <div className="w-full max-w-4xl bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 items-center">
            <div className="flex-1 flex items-center w-full px-4 h-14 bg-slate-50 rounded-xl border border-transparent focus-within:border-blue-500/50 focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
              <input className="w-full bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 focus:ring-0" placeholder="Where are you going?" type="text"/>
            </div>
            <div className="hidden md:block w-px h-8 bg-slate-200 mx-2"></div>
            <div className="flex-1 flex items-center w-full px-4 h-14 bg-slate-50 rounded-xl border border-transparent focus-within:border-blue-500/50 focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-slate-400 mr-3">calendar_month</span>
              <input className="w-full bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 focus:ring-0" placeholder="Check-in — Check-out" type="text"/>
            </div>
            <button className="w-full md:w-auto h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2">
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- 3. MAIN CONTENT (List Hotel Real) --- */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Hotels</h2>
            <p className="text-slate-500 mt-1">Top rated stays from our database</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg px-4 py-2 bg-white">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            <span>Filters</span>
          </button>
        </div>

        {/* LOADING & ERROR */}
        {loading && <div className="text-center py-20">Loading amazing hotels...</div>}
        {error && <div className="text-center py-20 text-red-500">Error: {error.message}</div>}

        {/* HOTEL GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data && data.hotels.map((hotel) => (
            <div key={hotel.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full border border-slate-100">
              
              {/* Gambar */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={hotel.imageUrl} 
                  alt={hotel.name} 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-yellow-500 text-[16px] fill-current">star</span> {hotel.rating || 4.5}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="truncate">{hotel.location}</span>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Starting from</span>
                    <span className="text-blue-600 font-bold text-lg">
                      Rp {(hotel.pricePerNight / 1000).toFixed(0)}k 
                      <span className="text-sm text-slate-500 font-normal"> / night</span>
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate(`/hotels/${hotel.id}`)}
                    className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-sm font-medium transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          © 2026 TravelApp Microservices Project. All rights reserved.
        </div>
      </footer>
    </div>
  );
}