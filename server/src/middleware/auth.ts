import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * SECURITY FIX: Authentication middleware for protected routes
 * Validates that requests come from authenticated admin sessions
 */

// Rate limiting store (simple in-memory, use Redis in production)
const requestCounts: Map<string, number[]> = new Map();

export const rateLimit = (windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!requestCounts.has(clientIp)) {
      requestCounts.set(clientIp, []);
    }

    const requests = requestCounts.get(clientIp)!;
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.' 
      });
    }

    recentRequests.push(now);
    requestCounts.set(clientIp, recentRequests);
    
    next();
  };
};

/**
 * Rate limiting specifically for OTP endpoints (stricter)
 * Prevents brute force attacks on OTP endpoints
 */
export const otpRateLimit = (windowMs: number = 5 * 60 * 1000, maxRequests: number = 3) => {
  const otpRequests: Map<string, number[]> = new Map();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body?.email || req.ip;
    const now = Date.now();
    
    if (!otpRequests.has(email)) {
      otpRequests.set(email, []);
    }

    const requests = otpRequests.get(email)!;
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many OTP requests. Please try again in a few minutes.' 
      });
    }

    recentRequests.push(now);
    otpRequests.set(email, recentRequests);
    
    next();
  };
};

/**
 * SECURITY FIX: Admin authentication middleware
 * Validates Admin-Token header (simple token-based auth)
 * In production, use JWT or OAuth
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Try to get token from httpOnly cookie first, then fallback to Authorization header
  let token = req.cookies?.adminToken;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Missing token.' });
  }

  const secret = process.env.ADMIN_SECRET_TOKEN;
  if (!secret) {
    return res.status(500).json({ error: 'Server misconfigured: missing ADMIN_SECRET_TOKEN' });
  }

  try {
    const payload = jwt.verify(token, secret) as { role?: string };
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};

/**
 * Input validation middleware
 * Prevents injection attacks by validating/sanitizing inputs
 */
export const validateInput = (rules: Record<string, (value: any) => boolean>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const [field, validator] of Object.entries(rules)) {
      const value = req.body[field];
      
      if (value !== undefined && !validator(value)) {
        return res.status(400).json({ 
          error: `Invalid value for field: ${field}` 
        });
      }
    }
    
    next();
  };
};

/**
 * SECURITY FIX: Sanitize error messages to prevent information disclosure
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  
  // Don't expose internal error details to clients
  res.status(err.status || 500).json({
    error: 'An error occurred. Please try again later.'
    // Never return: err.message, err.stack, database errors, etc.
  });
};

/**
 * SECURITY FIX: Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
};
