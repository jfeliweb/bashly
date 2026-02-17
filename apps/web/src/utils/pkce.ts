import { Buffer } from 'node:buffer';
import { webcrypto } from 'node:crypto';

/**
 * Generate a cryptographically random PKCE code verifier.
 * Spec: 43–128 chars from [A-Za-z0-9\-._~]
 * 32 random bytes → 43 Base64url chars (within spec).
 */
export async function generateCodeVerifier(): Promise<string> {
  const randomBytes = webcrypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(randomBytes);
}

/**
 * Derive the PKCE code challenge from the verifier.
 * Spotify only supports S256 — plain is not accepted.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await webcrypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hashBuffer));
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = Buffer.from(bytes).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
