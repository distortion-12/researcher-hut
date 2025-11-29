'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type Step = 'email' | 'otp' | 'newCredentials';

export default function ResetCredentialsPage() {
  const router = useRouter();
  const { sendResetOtp, resetAdminCredentials, adminEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<Step>('email');
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await sendResetOtp(formData.email);
    
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

    setStep('newCredentials');
    setLoading(false);
  };

  const handleResetCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await resetAdminCredentials(
      formData.email,
      formData.otp,
      formData.newUsername,
      formData.newPassword
    );
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess('Credentials updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-0 py-8">
      <div className="card-glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md">
        <div className="text-center mb-5 sm:mb-8">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 pulse-glow">
            <span className="text-2xl sm:text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Reset Credentials</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
            {step === 'email' && 'Enter admin email to receive OTP'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'newCredentials' && 'Set your new username and password'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
            step === 'email' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {step === 'email' ? '1' : '✓'}
          </div>
          <div className={`w-8 sm:w-12 h-1 rounded ${step !== 'email' ? 'bg-green-500' : 'glass'}`} />
          <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
            step === 'otp' ? 'bg-orange-500 text-white' : step === 'newCredentials' ? 'bg-green-500 text-white' : 'glass text-gray-500 dark:text-gray-400'
          }`}>
            {step === 'newCredentials' ? '✓' : '2'}
          </div>
          <div className={`w-8 sm:w-12 h-1 rounded ${step === 'newCredentials' ? 'bg-green-500' : 'glass'}`} />
          <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
            step === 'newCredentials' ? 'bg-orange-500 text-white' : 'glass text-gray-500 dark:text-gray-400'
          }`}>
            3
          </div>
        </div>

        {error && (
          <div className="glass bg-red-500/10 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="glass bg-green-500/10 text-green-600 dark:text-green-400 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 text-sm border border-green-200 dark:border-green-800">
            {success}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Admin Email</label>
              <input
                type="email"
                required
                placeholder="your-admin-email@example.com"
                className="w-full p-2.5 sm:p-3 input-glass rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {adminEmail && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Current admin: {adminEmail}</p>}
              {!adminEmail && <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">First time setup - enter your email to become admin</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-sm sm:text-base liquid-btn shadow-lg"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Enter OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                className="w-full p-2.5 sm:p-3 input-glass rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center text-xl sm:text-2xl tracking-widest font-mono"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">OTP expires in 5 minutes</p>
            </div>

            <button
              type="submit"
              disabled={loading || formData.otp.length !== 6}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-sm sm:text-base liquid-btn shadow-lg"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); setSuccess(''); }}
              className="w-full glass text-gray-500 dark:text-gray-400 py-2 text-sm hover:text-gray-700 dark:hover:text-gray-300 rounded-xl"
            >
              ← Back to email
            </button>
          </form>
        )}

        {/* Step 3: New Credentials */}
        {step === 'newCredentials' && (
          <form onSubmit={handleResetCredentials} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">New Username</label>
              <input
                type="text"
                required
                minLength={3}
                placeholder="Enter new username"
                className="w-full p-2.5 sm:p-3 input-glass rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                value={formData.newUsername}
                onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Minimum 3 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Enter new password"
                className="w-full p-2.5 sm:p-3 input-glass rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="Confirm new password"
                className="w-full p-2.5 sm:p-3 input-glass rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-sm sm:text-base liquid-btn shadow-lg"
            >
              {loading ? 'Updating...' : 'Update Credentials'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('otp'); setError(''); }}
              className="w-full glass text-gray-500 dark:text-gray-400 py-2 text-sm hover:text-gray-700 dark:hover:text-gray-300 rounded-xl"
            >
              ← Back to OTP
            </button>
          </form>
        )}

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20 dark:border-white/10 text-center space-y-2">
          <Link href="/admin/login" className="block text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            🔐 Back to Admin Login
          </Link>
          <Link href="/" className="block text-sm gradient-text hover:opacity-80">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
