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
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border-2 border-indigo-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Credentials</h1>
          <p className="text-gray-500 mt-2">
            {step === 'email' && 'Enter admin email to receive OTP'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'newCredentials' && 'Set your new username and password'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'email' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {step === 'email' ? '1' : '✓'}
          </div>
          <div className={`w-12 h-1 ${step !== 'email' ? 'bg-green-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'otp' ? 'bg-orange-500 text-white' : step === 'newCredentials' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step === 'newCredentials' ? '✓' : '2'}
          </div>
          <div className={`w-12 h-1 ${step === 'newCredentials' ? 'bg-green-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'newCredentials' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
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
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {adminEmail && <p className="text-xs text-gray-400 mt-1">Current admin: {adminEmail}</p>}
              {!adminEmail && <p className="text-xs text-orange-500 mt-1">First time setup - enter your email to become admin</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
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
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-center text-2xl tracking-widest font-mono"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
              />
              <p className="text-xs text-gray-400 mt-1 text-center">OTP expires in 5 minutes</p>
            </div>

            <button
              type="submit"
              disabled={loading || formData.otp.length !== 6}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
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

        {/* Step 3: New Credentials */}
        {step === 'newCredentials' && (
          <form onSubmit={handleResetCredentials} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Username</label>
              <input
                type="text"
                required
                minLength={3}
                placeholder="Enter new username"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                value={formData.newUsername}
                onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 3 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Enter new password"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="Confirm new password"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Updating...' : 'Update Credentials'}
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
          <Link href="/admin/login" className="block text-sm text-indigo-600 hover:text-indigo-800">
            🔐 Back to Admin Login
          </Link>
          <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
