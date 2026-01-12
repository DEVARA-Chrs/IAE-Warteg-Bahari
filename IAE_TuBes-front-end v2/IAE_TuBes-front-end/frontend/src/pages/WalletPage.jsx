import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';

// 1. QUERY BARU: Ambil Transaksi Real dari DB
const GET_WALLET_DATA = gql`
  query GetWalletData {
    me {
      id
      fullName
      balance
    }
    myTransactions {
      id
      type        # TOPUP / PAYMENT
      amount
      description
      createdAt
    }
  }
`;

const TOP_UP = gql`
  mutation TopUp($amount: Int!) {
    topUp(amount: $amount) {
      id
      balance
    }
  }
`;

export default function WalletPage() {
  const navigate = useNavigate();
  
  // Fetch Data (Tanpa Polling Biar Ringan, pake network-only biar fresh)
  const { data, loading, refetch } = useQuery(GET_WALLET_DATA, {
    fetchPolicy: "network-only"
  });

  const [topUp, { loading: processing }] = useMutation(TOP_UP, {
    onCompleted: () => {
      alert("✅ Top Up Berhasil!");
      refetch(); // Refresh data saldo & list
    },
    onError: (err) => alert("Gagal Top Up: " + err.message)
  });

  const handleTopUp = () => {
    const amountStr = prompt("Masukkan Jumlah Top Up (Rp):", "1000000");
    if (amountStr) {
      const amount = parseInt(amountStr);
      if (amount > 0) {
        topUp({ variables: { amount } });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div className="p-10 text-center">Loading Wallet...</div>;

  const user = data?.me || {};
  const transactions = data?.myTransactions || [];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 flex flex-col">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl cursor-pointer" onClick={() => navigate('/hotels')}>
          <span className="material-symbols-outlined">travel_explore</span> TravelApp
        </div>
        <nav className="flex gap-6">
           <button onClick={() => navigate('/home')} className="text-slate-500 hover:text-blue-600 font-medium">Home</button>
           <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-blue-600 font-medium">Dashboard</button>
           <button onClick={() => navigate('/history')} className="text-slate-500 hover:text-blue-600 font-medium">History</button>
           <button className="text-blue-600 font-bold border-b-2 border-blue-600">Wallet</button>
           <button onClick={() => navigate('/promos')} className="text-slate-500 hover:text-blue-600 font-medium">Promos</button>
           <button onClick={() => navigate('/profile')} className="text-slate-500 hover:text-blue-600 font-medium">Profile</button>
        </nav>
        <button onClick={handleLogout} className="text-red-500 font-medium text-sm">Logout</button>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">My Wallet</h2>
          <div className="flex items-center gap-3">
             <span className="text-slate-500 text-sm">Welcome, <b>{user.fullName}</b></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KIRI: KARTU SALDO & ACTIVITY */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* KARTU BIRU */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div>
                  <p className="text-blue-100 font-medium text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                    Total Balance
                  </p>
                  <h3 className="text-4xl font-bold mt-2 tracking-tight">
                    Rp {(user.balance || 0).toLocaleString()}
                  </h3>
                  <p className="text-blue-200 text-xs mt-1">Available for immediate booking</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={handleTopUp}
                    disabled={processing}
                    className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all border border-white/20 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    {processing ? "Processing..." : "Top Up"}
                  </button>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY LIST (REAL DATA DARI DB) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
               <div className="flex flex-col gap-4">
                  
                  {transactions.length === 0 && (
                    <p className="text-xs text-center text-slate-400 py-2">No transactions yet.</p>
                  )}

                  {transactions.map((trx) => (
                    <div key={trx.id} className="flex justify-between items-center animate-fadeIn">
                       <div className="flex items-center gap-3">
                          {/* Logika Icon & Warna */}
                          <div className={`size-10 rounded-full flex items-center justify-center ${
                            trx.type === 'TOPUP' 
                              ? 'bg-green-50 text-green-600' 
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            <span className="material-symbols-outlined">
                              {trx.type === 'TOPUP' ? 'add_card' : 'credit_card'}
                            </span>
                          </div>
                          
                          <div>
                             <p className="text-sm font-semibold text-slate-800">{trx.description}</p>
                             <p className="text-xs text-slate-400">
                                {new Date(parseInt(trx.createdAt)).toLocaleDateString()} • {trx.type}
                             </p>
                          </div>
                       </div>
                       
                       {/* Logika Warna Harga */}
                       <span className={`text-sm font-bold ${
                         trx.type === 'TOPUP' ? 'text-green-600' : 'text-slate-800'
                       }`}>
                         {trx.type === 'TOPUP' ? '+' : '-'} Rp {trx.amount.toLocaleString()}
                       </span>
                    </div>
                  ))}

               </div>
            </div>
          </div>

          {/* KANAN: PAYMENT METHODS (Tetap Dummy) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Payment Methods</h3>
                <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                   <span className="material-symbols-outlined text-[18px]">add</span> Add Card
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                   <div className="relative z-10 flex justify-between items-start mb-8">
                      <span className="font-bold italic text-lg">VISA</span>
                      <span className="material-symbols-outlined text-slate-400">more_horiz</span>
                   </div>
                   <div className="relative z-10 mb-6">
                      <p className="text-xs text-slate-400 uppercase mb-1">Card Number</p>
                      <p className="text-xl font-mono tracking-widest">•••• •••• •••• 4242</p>
                   </div>
                   <div className="relative z-10">
                      <p className="text-xs text-slate-400 uppercase mb-1">Expiry</p>
                      <p className="font-bold">12/28</p>
                   </div>
                   <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-center items-center text-center hover:bg-slate-50 cursor-pointer transition-colors h-full min-h-[200px]">
                   <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-slate-400 text-3xl">add_card</span>
                   </div>
                   <h4 className="font-bold text-slate-800">Add New Card</h4>
                   <p className="text-sm text-slate-500 mt-1">Visa, Mastercard, Amex</p>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}