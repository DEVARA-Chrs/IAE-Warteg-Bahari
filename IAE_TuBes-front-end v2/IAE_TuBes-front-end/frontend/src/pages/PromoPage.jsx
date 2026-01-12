import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

// 1. QUERY GRAPHQL (Ambil semua promo yang tersedia)
const GET_PROMOS = gql`
  query GetPromos {
    promos {
      id
      code
      discount
    }
  }
`;

export default function PromoPage() {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch Data dari Backend
  const { data, loading, error } = useQuery(GET_PROMOS);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Fitur Copy Code ke Clipboard
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000); // Reset status setelah 2 detik
  };

  // --- DATA HYBRID (Gabungan Real DB + Visual Dummy) ---
  // Kita mempercantik data mentah dari DB dengan gambar dan teks dummy
  const enhancedPromos = data?.promos.map((promo, index) => ({
    ...promo,
    // Data Visual Dummy (Biar sesuai desain)
    title: index % 2 === 0 ? "Liburan Hemat Akhir Tahun" : "Diskon Tiket Pesawat Spesial",
    description: `Gunakan kode ini untuk mendapatkan potongan harga langsung Rp ${promo.discount.toLocaleString()} untuk transaksi hotel atau pesawat.`,
    imageUrl: index % 2 === 0 
      ? "https://images.unsplash.com/photo-1571003123894-1a37b8189071?auto=format&fit=crop&w=800&q=80" // Gambar Hotel
      : "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80", // Gambar Pesawat
    tag: index === 0 ? "Hot Deal" : (promo.discount > 100000 ? "Best Value" : "Limited Offer"),
    validUntil: "31 Des 2025"
  })) || [];


  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* --- NAVBAR (Konsisten dengan halaman lain) --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl cursor-pointer" onClick={() => navigate('/hotels')}>
          <span className="material-symbols-outlined">travel_explore</span> TravelApp
        </div>
        <nav className="flex gap-6">
          <button onClick={() => navigate('/home')} className="text-slate-500 hover:text-blue-600 font-medium">Home</button>
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-blue-600 font-medium">Dashboard</button>
          <button onClick={() => navigate('/history')} className="text-slate-500 hover:text-blue-600 font-medium">History</button>
          <button onClick={() => navigate('/wallet')} className="text-slate-500 hover:text-blue-600 font-medium">Wallet</button>
          {/* Menu Promo Aktif */}
          <button className="text-blue-600 font-bold border-b-2 border-blue-600">Promos</button>
          <button onClick={() => navigate('/profile')} className="text-slate-500 hover:text-blue-600 font-medium">Profile</button>
        </nav>
        <button onClick={handleLogout} className="text-red-500 font-medium text-sm">Logout</button>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative bg-blue-600 py-20 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Exclusive <span className="text-orange-400">Deals & Discounts</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
            Unlock massive savings on your next adventure. Grab these limited-time offers before they're gone!
          </p>
        </div>
      </section>

      {/* --- MAIN CONTENT (GRID PROMO) --- */}
      <main className="max-w-6xl mx-auto p-8 -mt-10 relative z-20">
        
        {loading && <div className="text-center py-20 bg-white rounded-xl shadow-sm">Loading best deals for you...</div>}
        {error && <div className="text-center py-20 text-red-500 bg-white rounded-xl shadow-sm">Error loading promos. Please try again.</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {enhancedPromos.map((promo) => (
            <div key={promo.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col">
              
              {/* Gambar Header */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={promo.imageUrl} 
                  alt={promo.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    promo.tag === 'Hot Deal' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {promo.tag}
                  </span>
                </div>
              </div>

              {/* Konten Card */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{promo.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                  {promo.description}
                </p>

                <div className="mt-auto">
                  {/* Info Diskon & Validitas */}
                  <div className="flex items-end justify-between mb-6 p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Save Amount</p>
                      {/* Menampilkan Data Asli dari DB */}
                      <p className="text-2xl font-extrabold text-blue-600">Rp {promo.discount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Valid Until</p>
                       <p className="text-sm font-medium text-slate-700">{promo.validUntil}</p>
                    </div>
                  </div>
                  
                  {/* Tombol Copy Code */}
                  <div className="flex items-center gap-2 p-2 bg-white border-2 border-blue-100 rounded-xl focus-within:border-blue-500 transition-colors relative">
                    <div className="flex-1 flex items-center gap-2 px-2">
                      <span className="material-symbols-outlined text-slate-400">confirmation_number</span>
                      {/* Menampilkan KODE ASLI dari DB */}
                      <span className="font-mono font-bold text-lg text-slate-800 tracking-wider">{promo.code}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleCopy(promo.code)}
                      className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                        copiedCode === promo.code 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      {copiedCode === promo.code ? (
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">check</span> Copied!</span>
                      ) : "Copy Code"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </main>

      {/* Footer Simple */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-12 text-center text-slate-400 text-sm">
        <p>© 2026 TravelApp. All rights reserved.</p>
      </footer>

    </div>
  );
}