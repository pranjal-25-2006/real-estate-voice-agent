// Single-admin auth, deliberately dependency-free (no next-auth) so it
// works regardless of which Next.js version this project happens to be
// pinned to. Good enough for "one founder + maybe a teammate" logging
// into an internal dashboard — not meant to scale to many user accounts.
// If you outgrow that, swap this for next-auth or Clerk.
//
// Session signing uses Web Crypto (globalThis.crypto.subtle) rather than
// node:crypto because this file is imported from middleware.ts, which runs
// on Next's Edge runtime — node:crypto isn't guaranteed to work there, but
// Web Crypto works in both Edge and Node.

export const SESSION_COOKIE = "voiceagent_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SESSION_SECRET is not set. Add a long random string to .env.local — see DEPLOYMENT.md."
    );
  }
  return secret;
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSecret();
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function sign(value: string): Promise<string> {
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(sig);
}

/** Builds a signed "username.expiry.signature" session token. */
export async function createSessionToken(username: string): Promise<string> {
  const expiry = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${username}.${expiry}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

/** Verifies a session token's signature and expiry. Returns the username if valid. */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, expiryStr, signature] = parts;
  const payload = `${username}.${expiryStr}`;

  const expected = await sign(payload);
  if (!timingSafeEqualHex(signature, expected)) return null;

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return null;

  return username;
}

// ---------------------------------------------------------------------
// Password hashing (node:crypto scrypt). Only ever used from the login
// API route and the one-off hash-password script — both run on the
// Node.js runtime, never on Edge, so importing node:crypto here is safe.
// Stored format in .env.local: "<salt-hex>:<hash-hex>".
// ---------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const { scryptSync, randomBytes } = await import("crypto");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const { scryptSync, timingSafeEqual } = await import("crypto");
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
