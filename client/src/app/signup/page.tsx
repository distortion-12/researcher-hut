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
      <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-0">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl p-6 sm:p-8 w-full max-w-md text-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl sm:text-4xl">✓</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Account Created!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
            Your account has been created successfully. You can now sign in with your credentials.
          </p>
          <Link 
            href="/login"
            className="inline-block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:opacity-90 transition-all text-sm sm:text-base shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-0 py-4 sm:py-0">
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl p-5 sm:p-8 w-full max-w-md">
        <div className="text-center mb-5 sm:mb-8">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
            <span className="text-2xl sm:text-3xl">👤</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
            {step === 'details' && 'Join researcher.hut community'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow ${
            step === 'details' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-green-500 text-white'
          }`}>
            {step === 'details' ? '1' : '✓'}
          </div>
          <div className={`w-8 sm:w-12 h-1 rounded ${step !== 'details' ? 'bg-green-500' : 'bg-gray-200/50 dark:bg-gray-600/50'}`} />
          <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow ${
            step === 'otp' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            2
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm">
            {error}
          </div>
        )}

        {success && step === 'otp' && (
          <div className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 'details' && (
          <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="your_username"
                  className={`w-full p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100 text-sm sm:text-base ${
                    usernameAvailable === true ? 'border-green-500' : 
                    usernameAvailable === false ? 'border-red-500' : ''
                  }`}
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
                />
                {checkingUsername && (
                  <span className="absolute right-3 top-2.5 sm:top-3 text-gray-400">⏳</span>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="absolute right-3 top-2.5 sm:top-3 text-green-500">✓</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="absolute right-3 top-2.5 sm:top-3 text-red-500">✗</span>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Letters, numbers, underscores only. Min 3 characters.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Name</label>
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-sm sm:text-base shadow-sm"
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
                className="w-full p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-center text-xl sm:text-2xl tracking-widest font-mono text-gray-900 dark:text-gray-100"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">OTP sent to {formData.email}</p>
            </div>

            <button
              type="submit"
              disabled={loading || formData.otp.length !== 6}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-sm sm:text-base shadow-sm"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('details'); setError(''); setSuccess(''); }}
              className="w-full text-gray-500 dark:text-gray-400 py-2 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              ← Back to details
            </button>
          </form>
        )}

        <div className="mt-4 sm:mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
