// Generates the value to paste into AUTH_PASSWORD_HASH in .env.local.
//
// Usage:
//   node scripts/hash-password.mjs "your-chosen-password"

import { scryptSync, randomBytes } from "crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your-chosen-password"');
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
console.log(`${salt}:${hash}`);
