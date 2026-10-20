import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const OAUTH_STATE_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'bmp-oauth-fallback-secret';

export function getAppBaseUrl(request) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  const host = request?.headers?.get('x-forwarded-host') || request?.headers?.get('host') || 'localhost:3000';
  const proto = request?.headers?.get('x-forwarded-proto') || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function getGoogleRedirectUri(request) {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  const baseUrl = getAppBaseUrl(request);
  return `${baseUrl}/api/auth/google/callback`;
}

export function getGoogleOAuthClient(redirectUri) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.');
  }
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export function signState(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', OAUTH_STATE_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyState(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', OAUTH_STATE_SECRET).update(encoded).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    // State expires after 15 minutes
    if (Date.now() - (payload.iat || 0) > 15 * 60 * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
