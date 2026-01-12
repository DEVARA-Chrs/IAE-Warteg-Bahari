import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

// 1. Definisi Query GraphQL (Sesuai Backend Schema)
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      email
    }
  }
}
`;

const REGISTER_MUTATION = gql`
     mutation Register($fullName: String!, $email: String!, $password: String!) {
        register(fullName: $fullName, email: $email, password: $password) {
            id
            fullName
            email
        }
    }
`;

const GET_MY_BOOKINGS = gql`
  query GetMyBookings {
    myBookings {
      id
      flightCode
      passengerName
      status
      # createdAt  <-- Hapus atau komentari baris ini
    }
  }
`;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const navigate = useNavigate();

  // 2. Setup Apollo Mutation Hooks
  const [loginUser, { loading: loadingLogin }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      // Saat Login Sukses:
      localStorage.setItem('token', data.login.token); // Simpan token
      alert("Login Success! Redirecting...");
      navigate('/home'); // Pindah ke dashboard
    },
    onError: (err) => {
      alert("Login Failed: " + err.message);
    }
  });

  const [registerUser, { loading: loadingRegister }] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      // Saat Register Sukses:
      alert("Registration Success! Please Login.");
      setIsLogin(true); // Pindah ke tab login
    },
    onError: (err) => {
      alert("Registration Failed: " + err.message);
    }
  });

  // 3. Handle Form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      loginUser({ variables: { email: formData.email, password: formData.password } });
    } else {
      registerUser({ variables: { fullName: formData.fullName, email: formData.email, password: formData.password } });
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-100">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-4 py-8">
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-6 md:p-8 w-full border border-white/20 dark:border-slate-700/50">
          
          <div className="flex flex-col items-center mb-6">
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 text-primary">
              <span className="material-symbols-outlined text-3xl font-bold">flight_takeoff</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isLogin ? "Welcome Back" : "Start your journey"}
            </h1>
          </div>

          <div className="mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>Log In</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>Register</button>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <input id="fullName" type="text" placeholder="Jane Doe" className="block w-full px-4 py-3 rounded-lg border bg-slate-50 text-slate-900" onChange={handleChange} required />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email Address</label>
              <input id="email" type="email" placeholder="you@example.com" className="block w-full px-4 py-3 rounded-lg border bg-slate-50 text-slate-900" onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input id="password" type="password" placeholder="••••••••" className="block w-full px-4 py-3 rounded-lg border bg-slate-50 text-slate-900" onChange={handleChange} required />
            </div>

            <button type="submit" disabled={loadingLogin || loadingRegister} className="mt-2 w-full flex items-center justify-center rounded-lg bg-secondary px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-all">
              {(loadingLogin || loadingRegister) ? "Processing..." : (isLogin ? "Log In" : "Create Account")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}