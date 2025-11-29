'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type Step = 'email' | 'otp' | 'credentials';

export default function AdminLoginPage() {
  const router = useRouter();
  const { sendAdminOtp, verifyAdminOtp, adminEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    username: '',
    password: '',
  });

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
    <div className="flex-1 flex items-center justify-center px-4 sm:px-0 py-8">
      <div className="card-glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md hover-float">
        <div className="text-center mb-5 sm:mb-8">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg pulse-glow">
            <span className="text-2xl sm:text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Admin Access</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
            {step === 'email' && 'Enter admin email to receive OTP'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'credentials' && 'Enter your admin credentials'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow ${
            step === 'email' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-green-500 text-white'
          }`}>
            {step === 'email' ? '1' : '✓'}
          </div>
          <div className={`w-8 sm:w-12 h-1 rounded ${step !== 'email' ? 'bg-green-500' : 'bg-gray-200/50 dark:bg-gray-600/50'}`} />
          <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow ${
            step === 'otp' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : step === 'credentials' ? 'bg-green-500 text-white' : 'glass text-gray-500 dark:text-gray-400'
          }`}>
            {step === 'credentials' ? '✓' : '2'}
          </div>
          <div className={`w-8 sm:w-12 h-1 rounded ${step === 'credentials' ? 'bg-green-500' : 'bg-gray-200/50 dark:bg-gray-600/50'}`} />
          <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow ${
            step === 'credentials' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'glass text-gray-500 dark:text-gray-400'
          }`}>
            3
          </div>
        </div>

        {error && (
          <div className="glass bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="glass bg-green-100/80 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 text-sm">
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
                className="w-full p-2.5 sm:p-3 input-glass outline-none text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-sm sm:text-base liquid-btn shadow-lg"
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
                className="w-full p-2.5 sm:p-3 input-glass outline-none text-center text-xl sm:text-2xl tracking-widest font-mono text-gray-900 dark:text-gray-100"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">OTP expires in 5 minutes</p>
            </div>

            <button
              type="submit"
              disabled={loading || formData.otp.length !== 6}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-sm sm:text-base liquid-btn shadow-lg"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend OTP Button */}
            <button
              type="button"
              disabled={resending || resendCooldown > 0}
              onClick={async () => {
                setResending(true);
                setError('');
                const result = await sendAdminOtp(formData.email);
                if (result.error) {
                  setError(result.error);
                } else {
                  setSuccess('New OTP sent to your email!');
                  setResendCooldown(60);
                }
                setResending(false);
              }}
              className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:text-gray-400 dark:disabled:text-gray-500 transition-colors"
            >
              {resending ? (
                'Sending...'
              ) : resendCooldown > 0 ? (
                `Resend OTP in ${resendCooldown}s`
              ) : (
                '🔄 Resend OTP'
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); setSuccess(''); setResendCooldown(0); }}
              className="w-full text-gray-500 dark:text-gray-400 py-2 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              ← Back to email
            </button>
          </form>
        )}

        {/* Step 3: Credentials */}
        {step === 'credentials' && (
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Username</label>
              <input
                type="text"
                required
                placeholder="admin"
                className="w-full p-2.5 sm:p-3 input-glass outline-none text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-2.5 sm:p-3 input-glass outline-none text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-sm sm:text-base liquid-btn shadow-lg"
            >
              {loading ? 'Signing In...' : 'Access Admin Panel'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('otp'); setError(''); }}
              className="w-full text-gray-500 dark:text-gray-400 py-2 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              ← Back to OTP
            </button>
          </form>
        )}

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200/50 dark:border-gray-700/50 text-center space-y-2">
          <Link href="/admin/reset-credentials" className="block text-sm text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            🔑 Reset Admin Credentials
          </Link>
          <Link href="/" className="block text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
