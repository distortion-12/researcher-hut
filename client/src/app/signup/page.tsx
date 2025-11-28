'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, usersApi } from '@/lib/api';

type Step = 'details' | 'otp' | 'success';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const handleUsernameChange = async (username: string) => {
    setFormData({ ...formData, username });
    setUsernameAvailable(null);
    
    if (username.length < 3) {
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return;
    }

    setCheckingUsername(true);
    try {
      const { available } = await usersApi.checkUsername(username);
      setUsernameAvailable(available);
    } catch {
      setUsernameAvailable(true);
    }
    setCheckingUsername(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    if (usernameAvailable === false) {
      setError('Username is already taken');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await authApi.sendSignupOtp({
        email: formData.email,
        name: formData.name,
        username: formData.username,
        password: formData.password,
      });
      
      setSuccess(result.message || 'OTP sent to your email!');
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      await authApi.verifySignupOtp({
        email: formData.email,
        otp: formData.otp,
      });
      
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (step === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h1>
          <p className="text-gray-500 mb-6">
            Your account has been created successfully. You can now sign in with your credentials.
          </p>
          <Link 
            href="/login"
            className="inline-block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">
            {step === 'details' && 'Join researcher.hut community'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'details' ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'
          }`}>
            {step === 'details' ? '1' : '✓'}
          </div>
          <div className={`w-12 h-1 ${step !== 'details' ? 'bg-green-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'otp' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success && step === 'otp' && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 'details' && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="your_username"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                    usernameAvailable === true ? 'border-green-500' : 
                    usernameAvailable === false ? 'border-red-500' : 'border-gray-200'
                  }`}
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
                />
                {checkingUsername && (
                  <span className="absolute right-3 top-3 text-gray-400">⏳</span>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="absolute right-3 top-3 text-green-500">✓</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="absolute right-3 top-3 text-red-500">✗</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Letters, numbers, underscores only. Min 3 characters.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
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
              <p className="text-xs text-gray-400 mt-1 text-center">OTP sent to {formData.email}</p>
            </div>

            <button
              type="submit"
              disabled={loading || formData.otp.length !== 6}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('details'); setError(''); setSuccess(''); }}
              className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
            >
              ← Back to details
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
