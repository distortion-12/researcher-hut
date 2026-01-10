/**
 * SECURITY FIX: Input validation and sanitization utilities
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate username format
 */
export const isValidUsername = (username: string): boolean => {
  // Alphanumeric, hyphens, underscores, 3-32 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,32}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, contains uppercase, lowercase, number, special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Sanitize text input (XSS prevention)
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  // Remove any HTML/script tags
  return text.replace(/<[^>]*>/g, '').trim();
};

/**
 * Sanitize HTML content
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  // Use DOMPurify to clean HTML content
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    KEEP_CONTENT: true,
  });
};

/**
 * Validate slug format
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
};

/**
 * Sanitize number input
 */
export const sanitizeNumber = (num: any): number | null => {
  const parsed = parseInt(num, 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Validate OTP format (6 digits)
 */
export const isValidOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};
