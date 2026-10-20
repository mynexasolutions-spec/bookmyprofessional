import { describe, it } from 'node:test';
import assert from 'node:assert';
import { signState, verifyState, getAppBaseUrl, getGoogleRedirectUri, getGoogleOAuthClient } from '../src/lib/google-oauth.js';

describe('Direct Google OAuth Helper', () => {
  it('signs and verifies state payload successfully', () => {
    const payload = { role: 'professional', next: '/vendor', nonce: 'abc123xyz', iat: Date.now() };
    const token = signState(payload);
    assert.ok(token.includes('.'), 'Token must contain a dot separator');

    const decoded = verifyState(token);
    assert.deepStrictEqual(decoded.role, 'professional');
    assert.deepStrictEqual(decoded.next, '/vendor');
    assert.deepStrictEqual(decoded.nonce, 'abc123xyz');
  });

  it('rejects tampered state tokens', () => {
    const payload = { role: 'customer', next: '/dashboard', iat: Date.now() };
    const token = signState(payload);
    const tampered = token.slice(0, -3) + 'abc';
    assert.strictEqual(verifyState(tampered), null);
  });

  it('rejects expired state tokens', () => {
    // 20 minutes ago
    const payload = { role: 'customer', next: '/dashboard', iat: Date.now() - 20 * 60 * 1000 };
    const token = signState(payload);
    assert.strictEqual(verifyState(token), null);
  });

  it('computes correct redirect URI based on request host', () => {
    const fakeReq = {
      headers: new Headers({
        host: 'bookmyprofessional.com',
        'x-forwarded-proto': 'https',
      }),
    };
    const uri = getGoogleRedirectUri(fakeReq);
    assert.strictEqual(uri, 'https://bookmyprofessional.com/api/auth/google/callback');
  });

  it('instantiates OAuth2Client when client ID and secret are set', () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    const client = getGoogleOAuthClient('http://localhost:3000/api/auth/google/callback');
    assert.ok(client, 'Client should be instantiated');
  });
});
