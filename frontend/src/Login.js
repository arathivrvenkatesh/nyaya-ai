import React, { useState } from 'react';
import { auth, googleProvider } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked! Please allow popups for this site or use email login below.');
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚖️</div>
          <h1 className="text-white font-bold text-3xl tracking-widest">NYAYA AI</h1>
          <p className="text-yellow-400 text-sm tracking-widest uppercase mt-2">
            Legal Rights Assistant
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">

          {/* Card Header */}
          <div className="bg-slate-900 px-6 py-4 border-b-4 border-yellow-400">
            <h2 className="text-white font-semibold text-lg tracking-wide">
              {isSignup ? '📝 Create Account' : '🔐 Welcome Back'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {isSignup ? 'Sign up for free legal assistance' : 'Sign in to access legal help'}
            </p>
          </div>

          <div className="p-6">

            {/* Google Button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-yellow-400 text-slate-700 font-semibold py-3 rounded-lg transition mb-4 disabled:opacity-50"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                style={{width: '18px', height: '18px'}}
              />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-slate-400 text-xs">or use email</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Email Input */}
            <div className="mb-3">
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Email</p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Password</p>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm mb-4">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleEmailAuth}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-yellow-400 text-yellow-400 hover:text-slate-900 border-2 border-slate-900 font-bold py-3 rounded-lg tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-50"
            >
              {loading ? '⏳ Please wait...' : isSignup ? '🚀 Create Account' : '🔐 Sign In'}
            </button>

            {/* Toggle signup/login */}
            <p className="text-center text-sm text-slate-500 mt-4">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => { setIsSignup(!isSignup); setError(''); }}
                className="text-yellow-600 font-semibold ml-1 hover:underline"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Free • Secure • Confidential
        </p>
      </div>
    </div>
  );
}

export default Login;