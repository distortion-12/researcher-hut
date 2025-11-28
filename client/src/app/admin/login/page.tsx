'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type Step = 'email' | 'otp' | 'credentials';

export default function AdminLoginPage() {
  const router = useRouter();
  const { sendAdminOtp, verifyAdminOtp, adminEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<Step>('email');
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    username: '',
    password: '',
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await sendAdminOtp(formData.email);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('OTP sent to your email! Check your inbox.');
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    setStep('credentials');
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verifyAdminOtp(
      formData.email,
      formData.otp,
      formData.username,
      formData.password
    );
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border-2 border-indigo-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-gray-500 mt-2">
            {step === 'email' && 'Enter admin email to receive OTP'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'credentials' && 'Enter your admin credentials'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'email' ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'
          }`}>
            {step === 'email' ? '1' : '✓'}
          </div>
          <div className={`w-12 h-1 ${step !== 'email' ? 'bg-green-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'otp' ? 'bg-indigo-600 text-white' : step === 'credentials' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step === 'credentials' ? '✓' : '2'}
          </div>
          <div className={`w-12 h-1 ${step === 'credentials' ? 'bg-green-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'credentials' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            3
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
              <input
                type="email"
                required
                placeholder="your-admin-email@example.com"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {adminEmail && <p className="text-xs text-gray-400 mt-1">Configured admin: {adminEmail}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center text-2xl tracking-widest font-mono"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
              />
              <p className="text-xs text-gray-400 mt-1 text-center">OTP expires in 5 minutes</p>
            </div>

            <button
              type="submit"
              disabled={loading || formData.otp.length !== 6}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); setSuccess(''); }}
              className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
            >
              ← Back to email
            </button>
          </form>
        )}

        {/* Step 3: Credentials */}
        {step === 'credentials' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                required
                placeholder="admin"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Signing In...' : 'Access Admin Panel'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('otp'); setError(''); }}
              className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
            >
              ← Back to OTP
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
          <Link href="/admin/reset-credentials" className="block text-sm text-indigo-600 hover:text-indigo-800">
            🔑 Reset Admin Credentials
          </Link>
          <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
