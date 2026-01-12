import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Hapus 'BrowserRouter as Router'
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MemberDashboard from './pages/MemberDashboard';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import HistoryPage from './pages/HistoryPage'; 
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import PromoPage from './pages/PromoPage';

function App() {
  return (
    // PERBAIKAN: Kita HAPUS <Router> pembungkus di sini
    // Karena sudah ada di main.jsx
    <Routes>
      {/* Halaman Pertama kali dibuka = Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Pindahkan AuthPage ke /login */}
      <Route path="/login" element={<AuthPage />} />
      
      {/* Halaman User yang sudah login */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/dashboard" element={<MemberDashboard />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/hotels/:id" element={<HotelDetail />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/promos" element={<PromoPage />} />
    </Routes>
  );
}

export default App;