import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';

const GET_MY_BOOKINGS = gql`
  query GetMyBookings {
    myBookings {
      id
      flightCode
      hotelName
      type
      passengerName
      status
    }
  }
`;

const PAY_BOOKING = gql`
  mutation PayBooking($bookingId: String!, $amount: Int!, $method: String!) {
    payBooking(bookingId: $bookingId, amount: $amount, method: $method) {
      id
      status
    }
  }
`;

// --- BARU: MUTASI WALLET ---
const PAY_WITH_WALLET = gql`
  mutation PayWithWallet($amount: Int!) {
    payWithWallet(amount: $amount) {
      id
      balance
    }
  }
`;

export default function HistoryPage() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('ALL'); 

  const { data, loading, error, refetch } = useQuery(GET_MY_BOOKINGS, {
    pollInterval: 2000 
  });

  const [payWithWallet] = useMutation(PAY_WITH_WALLET);

  const [payBooking] = useMutation(PAY_BOOKING, {
    onCompleted: () => {
      alert("✅ Payment Success!");
      refetch();
    },
    onError: (err) => alert("Failed: " + err.message)
  });

  const handlePay = async (booking) => {
    const price = booking.type === 'HOTEL' ? 750000 : 1500000;
    
    if (window.confirm(`Pay Rp ${price.toLocaleString()} using Wallet Balance?`)) {
      try {
        // 1. Potong Saldo
        await payWithWallet({ variables: { amount: price } });
        
        // 2. Update Status Booking
        await payBooking({ variables: { bookingId: booking.id, amount: price, method: "WALLET" } });
        
      } catch (err) {
        alert("❌ Payment Failed: " + err.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const filteredData = data?.myBookings.filter((booking) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'UNPAID') return booking.status === 'BOOKED';
    if (filterStatus === 'COMPLETED') return booking.status === 'PAID';
    return true;
  });

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
          <button className="text-blue-600 font-bold border-b-2 border-blue-600">History</button>
          <button onClick={() => navigate('/wallet')} className="text-slate-500 hover:text-blue-600 font-medium">Wallet</button>
          <button onClick={() => navigate('/promos')} className="text-slate-500 hover:text-blue-600 font-medium">Promos</button>
          <button onClick={() => navigate('/profile')} className="text-slate-500 hover:text-blue-600 font-medium">Profile</button>
        </nav>
        <button onClick={handleLogout} className="text-red-500 font-medium text-sm">Logout</button>
      </header>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Order History</h1>
            <p className="text-slate-500">Manage and view your past and upcoming trips</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-8 border-b border-slate-200 mb-6">
          <button onClick={() => setFilterStatus('ALL')} className={`pb-3 border-b-2 text-sm font-bold transition-colors ${filterStatus === 'ALL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>All Orders</button>
          <button onClick={() => setFilterStatus('UNPAID')} className={`pb-3 border-b-2 text-sm font-bold transition-colors ${filterStatus === 'UNPAID' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Unpaid</button>
          <button onClick={() => setFilterStatus('COMPLETED')} className={`pb-3 border-b-2 text-sm font-bold transition-colors ${filterStatus === 'COMPLETED' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Completed</button>
        </div>

        {/* LIST */}
        <div className="flex flex-col gap-4">
          {loading && <p>Loading history...</p>}
          {error && <p className="text-red-500">Error: {error.message}</p>}
          
          {filteredData && filteredData.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
              <p>No orders found.</p>
            </div>
          )}
          
          {filteredData && filteredData.map((booking) => (
            <div key={booking.id} className="group bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${booking.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                      {booking.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">ID: {booking.id}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {booking.type === 'HOTEL' ? booking.hotelName : `Flight ${booking.flightCode}`}
                  </h3>
                  
                  <div className="flex flex-col gap-1 text-sm text-slate-500 mt-2">
                     <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">person</span> Passenger: {booking.passengerName}</p>
                     <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">{booking.type === 'HOTEL' ? 'hotel' : 'flight_takeoff'}</span> Type: {booking.type} Booking</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Total</span>
                    <span className="text-lg font-bold text-slate-900">Rp {(booking.type === 'HOTEL' ? 750000 : 1500000).toLocaleString()}</span>
                  </div>
                  
                  {booking.status === 'BOOKED' ? (
                    <button onClick={() => handlePay(booking)} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">credit_card</span> Pay Now
                    </button>
                  ) : (
                    <button className="border border-slate-200 text-blue-600 px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">download</span> Ticket
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden md:block w-48 shrink-0 bg-cover bg-center rounded-lg" style={{ backgroundImage: booking.type === 'HOTEL' ? 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80")' : 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80")' }}></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}