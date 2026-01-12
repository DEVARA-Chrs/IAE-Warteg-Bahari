import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 transition-colors duration-200">
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        
        {/* --- HEADER --- */}
        <header className="absolute top-0 w-full z-10 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="size-8 text-blue-600 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
            </div>
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">Travel Aggregator</h2>
          </div>
          <button className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
             Need Help?
          </button>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-grow flex items-center justify-center p-6 relative">
          
          {/* Background Blobs (Hiasan) */}
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[80px] pointer-events-none"></div>

          {/* CARD CONTAINER */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 w-full max-w-6xl h-[650px] overflow-hidden flex flex-col md:flex-row relative z-0">
            
            {/* KIRI: GAMBAR / CAROUSEL */}
            <div className="w-full md:w-1/2 bg-slate-50 relative p-8 md:p-12 flex flex-col justify-center items-center overflow-hidden">
              {/* Lingkaran Hiasan Belakang Gambar */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-blue-600/20 to-orange-500/20 rounded-full animate-pulse"></div>
              
              {/* Gambar Utama */}
              <div className="relative z-10 w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-[1.02]">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80")' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 inline-flex items-center gap-1 mb-2 border border-white/30">
                      <span className="material-symbols-outlined text-sm text-orange-400">verified</span>
                      <span className="text-xs font-semibold">Best Price Guaranteed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex gap-2 mt-8 z-10">
                <div className="h-2 w-8 rounded-full bg-blue-600 transition-all duration-300"></div>
                <div className="h-2 w-2 rounded-full bg-slate-300 cursor-pointer transition-all duration-300"></div>
                <div className="h-2 w-2 rounded-full bg-slate-300 cursor-pointer transition-all duration-300"></div>
              </div>
            </div>

            {/* KANAN: TEKS & BUTTON */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
              <div className="flex-grow flex flex-col justify-center max-w-lg mx-auto md:mx-0">
                <span className="text-blue-600 font-bold text-sm tracking-widest uppercase mb-4">Step 1 of 3</span>
                
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-[1.15]">
                  Unlock Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Hotel Prices</span>
                </h1>
                
                <p className="text-slate-500 text-lg leading-relaxed mb-10">
                  Compare prices from hundreds of sites instantly. We aggregate the best deals so you can find the perfect stay that fits your budget without the hassle.
                </p>

                {/* Features List */}
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center size-6 rounded-full bg-green-100 text-green-600">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </span>
                    <span className="text-slate-700 font-medium">Real-time price comparison</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center size-6 rounded-full bg-green-100 text-green-600">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </span>
                    <span className="text-slate-700 font-medium">Exclusive member discounts</span>
                  </div>
                </div>
              </div>

              {/* TOMBOL AKSI */}
              <div className="mt-auto flex flex-col sm:flex-row gap-4 items-center border-t border-slate-100 pt-8 w-full max-w-lg mx-auto md:mx-0">
                <button 
                  onClick={() => navigate('/login')} // KE HALAMAN LOGIN
                  className="w-full sm:flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 group"
                >
                  <span>Get Started</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                
                <button 
                  onClick={() => navigate('/login')} // KE HALAMAN LOGIN JUGA
                  className="w-full sm:w-auto h-14 px-8 text-slate-500 hover:text-slate-900 font-semibold text-base rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>

          </div>
        </main>

        <footer className="absolute bottom-4 w-full text-center pb-2">
            <p className="text-xs text-slate-400">
                By continuing, you agree to our <a className="underline hover:text-slate-500" href="#">Terms of Service</a> & <a className="underline hover:text-slate-500" href="#">Privacy Policy</a>.
            </p>
        </footer>
      </div>
    </div>
  );
}