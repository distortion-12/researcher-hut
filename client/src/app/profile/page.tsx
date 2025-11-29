'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usersApi, authApi } from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [usernameChangeAllowed, setUsernameChangeAllowed] = useState(true);
  const [daysUntilChange, setDaysUntilChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Profile picture upload states
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email change states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Admin has a different profile system
    if (isAdmin) {
      router.push('/admin');
      return;
    }

    loadUserData();
  }, [user, isAdmin, router]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Try to get user data, but handle if user doesn't exist in users table yet
      let userData = null;
      try {
        userData = await usersApi.getById(user.id);
      } catch (err) {
        // User might not exist in users table yet, use auth context data
        console.log('User not found in users table, using auth data');
      }
      
      setName(userData?.name || user.name || '');
      setUsername(userData?.username || user.username || '');
      setCurrentEmail(userData?.email || user.email || '');
      setOriginalUsername(userData?.username || user.username || '');
      setProfilePicture(userData?.profile_picture || '');

      // Check username change status (with fallback)
      try {
        const changeStatus = await usersApi.checkUsernameChangeStatus(user.id);
        setUsernameChangeAllowed(changeStatus.allowed);
        setDaysUntilChange(changeStatus.daysRemaining);
      } catch (err) {
        // If this fails, allow username change (first time)
        setUsernameChangeAllowed(true);
        setDaysUntilChange(0);
      }
    } catch (err) {
      // Use data from auth context as fallback
      setName(user.name || '');
      setUsername(user.username || '');
      setCurrentEmail(user.email || '');
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = async (value: string) => {
    setUsernameError('');
    
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }

    // Check format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(value)) {
      setUsernameError('Username must be 3-20 characters with only letters, numbers, and underscores');
      return false;
    }

    // If username hasn't changed, no need to check availability
    if (value.toLowerCase() === originalUsername.toLowerCase()) {
      return true;
    }

    // Check if username change is allowed
    if (!usernameChangeAllowed) {
      setUsernameError(`You can change your username again in ${daysUntilChange} days`);
      return false;
    }

    // Check availability
    setCheckingUsername(true);
    try {
      const result = await usersApi.checkUsername(value);
      if (!result.available) {
        setUsernameError('This username is already taken');
        return false;
      }
    } catch (err) {
      setUsernameError('Failed to check username availability');
      return false;
    } finally {
      setCheckingUsername(false);
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    // Validate username if changed
    if (username.toLowerCase() !== originalUsername.toLowerCase()) {
      const isValid = await validateUsername(username);
      if (!isValid) return;
    }

    setSaving(true);
    try {
      await usersApi.update(user.id, { name, username });
      setSuccess('Profile updated successfully!');
      setOriginalUsername(username.toLowerCase());
      
      // Refresh username change status
      try {
        const changeStatus = await usersApi.checkUsernameChangeStatus(user.id);
        setUsernameChangeAllowed(changeStatus.allowed);
        setDaysUntilChange(changeStatus.daysRemaining);
      } catch (err) {
        // Ignore if this fails
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Email change handlers
  const handleSendEmailOtp = async () => {
    if (!user) return;
    
    setEmailError('');
    setEmailSuccess('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailError('New email must be different from current email');
      return;
    }

    setEmailLoading(true);
    try {
      await authApi.sendEmailChangeOtp({
        userId: user.id,
        currentEmail: currentEmail,
        newEmail: newEmail,
      });
      setEmailStep('verify');
      setEmailSuccess('Verification code sent to ' + newEmail);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to send verification code');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!user) return;
    
    setEmailError('');
    setEmailSuccess('');

    if (emailOtp.length !== 6) {
      setEmailError('Please enter a valid 6-digit code');
      return;
    }

    setEmailLoading(true);
    try {
      const result = await authApi.verifyEmailChange({
        userId: user.id,
        otp: emailOtp,
      });
      
      setEmailSuccess('Email updated successfully!');
      setCurrentEmail(result.newEmail);
      
      // Close modal after short delay (no reload)
      setTimeout(() => {
        setShowEmailModal(false);
        resetEmailModal();
      }, 1500);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to verify code');
    } finally {
      setEmailLoading(false);
    }
  };

  const resetEmailModal = () => {
    setShowEmailModal(false);
    setNewEmail('');
    setEmailOtp('');
    setEmailStep('input');
    setEmailError('');
    setEmailSuccess('');
  };

  // Profile picture handlers
  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setUploadingPicture(true);
    setError('');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        try {
          await usersApi.update(user.id, { profile_picture: base64 });
          setProfilePicture(base64);
          setSuccess('Profile picture updated!');
        } catch (err: any) {
          setError(err.message || 'Failed to upload picture');
        } finally {
          setUploadingPicture(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        setUploadingPicture(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload picture');
      setUploadingPicture(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!user) return;
    
    setUploadingPicture(true);
    try {
      await usersApi.update(user.id, { profile_picture: '' });
      setProfilePicture('');
      setSuccess('Profile picture removed!');
    } catch (err: any) {
      setError(err.message || 'Failed to remove picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 font-medium"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and profile information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg">
                  {(name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Upload overlay */}
              <button
                onClick={handlePictureClick}
                disabled={uploadingPicture}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {uploadingPicture ? (
                  <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            {/* Picture actions */}
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={handlePictureClick}
                disabled={uploadingPicture}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
              >
                {profilePicture ? 'Change Photo' : 'Upload Photo'}
              </button>
              {profilePicture && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={handleRemovePicture}
                    disabled={uploadingPicture}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 2MB, JPG/PNG</p>
          </div>

          {/* Email (clickable to change) */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-gray-800 dark:text-gray-200 font-medium">{currentEmail}</p>
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
              >
                Change
              </button>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-center">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Your display name"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You can change your display name anytime
              </p>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    setUsernameError('');
                  }}
                  onBlur={() => username !== originalUsername && validateUsername(username)}
                  className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                    usernameError 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-200 dark:border-gray-600'
                  } bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="username"
                  disabled={!usernameChangeAllowed && username !== originalUsername}
                  required
                />
                {checkingUsername && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </div>
              {usernameError ? (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{usernameError}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {!usernameChangeAllowed ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      ⏳ Username can be changed in {daysUntilChange} days
                    </span>
                  ) : (
                    <>3-20 characters. Letters, numbers, underscores only. Can be changed once every 30 days.</>
                  )}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || checkingUsername}
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 sm:p-6 border border-indigo-100 dark:border-indigo-800">
          <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
            📋 Profile Rules
          </h3>
          <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
            <li>• Display name can be changed anytime</li>
            <li>• Username can only be changed once every 30 days</li>
            <li>• Username must be 3-20 characters</li>
            <li>• Only letters, numbers, and underscores allowed in username</li>
            <li>• Email change requires verification of the new email</li>
          </ul>
        </div>
      </div>

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={resetEmailModal}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Change Email
              </h3>
              <button
                onClick={resetEmailModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Success Message */}
            {emailSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
                {emailSuccess}
              </div>
            )}

            {/* Error Message */}
            {emailError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {emailError}
              </div>
            )}

            {emailStep === 'input' ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Current email: <span className="font-medium">{currentEmail}</span>
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="newemail@example.com"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  A verification code will be sent to your new email address.
                </p>
                <button
                  onClick={handleSendEmailOtp}
                  disabled={emailLoading || !newEmail}
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Enter the 6-digit code sent to <span className="font-medium">{newEmail}</span>
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEmailStep('input');
                      setEmailOtp('');
                      setEmailError('');
                    }}
                    className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyEmailChange}
                    disabled={emailLoading || emailOtp.length !== 6}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {emailLoading ? 'Verifying...' : 'Verify & Update'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
