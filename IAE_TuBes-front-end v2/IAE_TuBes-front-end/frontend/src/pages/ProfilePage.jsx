import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';

// 1. QUERY: Ambil data user lengkap dari Database (via Gateway -> Membership Service)
const GET_ME = gql`
  query GetMe {
    me {
      id
      #username
      fullName # Nama Asli dari DB
      email    # Email Asli dari DB
      phone    # No HP dari DB
      location # Lokasi dari DB
      tier     # Status Member (Silver/Gold)
      points   # Jumlah Poin
    }
  }
`;

// 2. MUTATION: Update data profil ke Database
const UPDATE_PROFILE = gql`
  mutation UpdateProfile($email: String, $fullName: String, $phone: String, $location: String) {
    updateProfile(email: $email, fullName: $fullName, phone: $phone, location: $location) {
      id
      email
      fullName
      phone
      location
    }
  }
`;

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // State awal kosong, menunggu data dari Backend
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    tier: "Silver",
    points: 0
  });

  // FETCH DATA SAAT HALAMAN DIBUKA
  const { data, loading, error, refetch } = useQuery(GET_ME, {
    fetchPolicy: "network-only", // Selalu ambil data terbaru dari server
    onCompleted: (data) => {
      if (data.me) {
        setProfile({
          fullName: data.me.fullName || data.me.username || "User",
          email: data.me.email || "",
          phone: data.me.phone || "",
          location: data.me.location || "",
          tier: data.me.tier || "Silver",
          points: data.me.points || 0
        });
      }
    },
    onError: (err) => {
      console.error("Gagal ambil profil:", err);
      // Opsional: Jika token expired, bisa logout otomatis
      // localStorage.removeItem('token');
      // navigate('/');
    }
  });

  // SETUP MUTATION UPDATE
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE, {
    onCompleted: () => {
      alert("✅ Profil Berhasil Diupdate ke Database!");
      setIsEditing(false);
      refetch(); // Ambil ulang data terbaru untuk memastikan sinkronisasi
    },
    onError: (err) => {
      alert("❌ Gagal Update: " + err.message);
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Kirim data ke Backend
    updateProfile({
      variables: {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location
      }
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Profile...</div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl cursor-pointer" onClick={() => navigate('/hotels')}>
          <span className="material-symbols-outlined">travel_explore</span> TravelApp
        </div>
        <nav className="flex gap-6">
          <button onClick={() => navigate('/home')} className="text-slate-500 hover:text-blue-600 font-medium">Home</button>
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-blue-600 font-medium">Dashboard</button>
          <button onClick={() => navigate('/history')} className="text-slate-500 hover:text-blue-600 font-medium">History</button>
          <button onClick={() => navigate('/wallet')} className="text-slate-500 hover:text-blue-600 font-medium">Wallet</button>
          <button onClick={() => navigate('/promos')} className="text-slate-500 hover:text-blue-600 font-medium">Promos</button>
          <button className="text-blue-600 font-bold border-b-2 border-blue-600">Profile</button>
        </nav>
        <button onClick={handleLogout} className="text-red-500 font-medium text-sm">Logout</button>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        {/* HEADER */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
            <p className="mt-2 text-sm text-slate-500">Manage your personal information and loyalty status.</p>
          </div>
          
          {/* TOMBOL EDIT / SAVE (DINAMIS) */}
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
               <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="text-slate-500 font-medium hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white font-medium hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 shadow-sm disabled:bg-blue-400"
              >
                 {saving ? "Saving..." : <><span className="material-symbols-outlined text-[18px]">save</span> Save Changes</>}
              </button>
            </div>
          )}
        </div>

        {/* MEMBERSHIP CARD */}
        <section className="mb-10 relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg text-white p-8 transition-transform hover:scale-[1.01]">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-orange-500 opacity-20 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-4">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 h-fit">
                <span className="material-symbols-outlined text-4xl text-yellow-300">verified</span>
              </div>
              <div>
                <h2 className="text-sm uppercase tracking-wider font-semibold text-blue-100 mb-1">Membership Status</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-display">{profile.fullName}</span> {/* Nama Dinamis */}
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase text-blue-900 ${
                    profile.tier === 'Gold' ? 'bg-yellow-400' : 
                    profile.tier === 'Platinum' ? 'bg-slate-300' : 'bg-slate-400'
                  }`}>
                    {profile.tier}
                  </span>
                </div>
                <p className="text-blue-100 text-sm mt-1">Member since March 2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm uppercase tracking-wider font-semibold text-blue-100 mb-1">Available Points</p>
              <span className="text-4xl font-bold tracking-tight">{profile.points.toLocaleString()}</span>
              <p className="text-xs text-blue-200 mt-1">Value approx Rp {(profile.points * 100).toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* PERSONAL INFO FORM */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">badge</span>
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Field: Full Name */}
            <div className="group">
              <label className="block text-xs font-medium uppercase text-slate-500 mb-1.5">Full Name</label>
              <div className={`flex items-center px-4 py-3 rounded-lg border ${isEditing ? 'bg-white border-blue-500 ring-2 ring-blue-100' : 'bg-slate-50 border-transparent'}`}>
                <span className="material-symbols-outlined text-slate-400 mr-3">person</span>
                {isEditing ? (
                  <input 
                    type="text" name="fullName" value={profile.fullName} onChange={handleChange}
                    className="bg-transparent outline-none w-full font-medium text-slate-900"
                  />
                ) : (
                  <span className="font-medium text-slate-900">{profile.fullName}</span>
                )}
              </div>
            </div>

            {/* Field: Email */}
            <div className="group">
              <label className="block text-xs font-medium uppercase text-slate-500 mb-1.5">Email Address</label>
              <div className={`flex items-center px-4 py-3 rounded-lg border ${isEditing ? 'bg-white border-blue-500 ring-2 ring-blue-100' : 'bg-slate-50 border-transparent'}`}>
                <span className="material-symbols-outlined text-slate-400 mr-3">mail</span>
                {isEditing ? (
                  <input 
                    type="email" name="email" value={profile.email} onChange={handleChange}
                    className="bg-transparent outline-none w-full font-medium text-slate-900"
                  />
                ) : (
                  <span className="font-medium text-slate-900">{profile.email}</span>
                )}
              </div>
            </div>

            {/* Field: Phone (Real DB) */}
            <div className="group">
              <label className="block text-xs font-medium uppercase text-slate-500 mb-1.5">Phone Number</label>
              <div className={`flex items-center px-4 py-3 rounded-lg border ${isEditing ? 'bg-white border-blue-500 ring-2 ring-blue-100' : 'bg-slate-50 border-transparent'}`}>
                <span className="material-symbols-outlined text-slate-400 mr-3">call</span>
                {isEditing ? (
                  <input 
                    type="text" name="phone" value={profile.phone} onChange={handleChange}
                    className="bg-transparent outline-none w-full font-medium text-slate-900"
                  />
                ) : (
                  <span className="font-medium text-slate-900">{profile.phone || "-"}</span>
                )}
              </div>
            </div>

            {/* Field: Location (Real DB) */}
            <div className="group">
              <label className="block text-xs font-medium uppercase text-slate-500 mb-1.5">Home Airport</label>
              <div className={`flex items-center px-4 py-3 rounded-lg border ${isEditing ? 'bg-white border-blue-500 ring-2 ring-blue-100' : 'bg-slate-50 border-transparent'}`}>
                <span className="material-symbols-outlined text-slate-400 mr-3">flight</span>
                {isEditing ? (
                  <input 
                    type="text" name="location" value={profile.location} onChange={handleChange}
                    className="bg-transparent outline-none w-full font-medium text-slate-900"
                  />
                ) : (
                  <span className="font-medium text-slate-900">{profile.location || "-"}</span>
                )}
              </div>
            </div>

          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
               <span className="material-symbols-outlined text-[18px]">logout</span> Log Out
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}