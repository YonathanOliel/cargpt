import { Injectable } from '@nestjs/common';
import { createHash, randomInt } from 'node:crypto';

interface OtpEntry {
  codeHash: string;
  expiresAt: number;
  attempts: number;
}

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/**
 * In-memory OTP store. Codes are stored hashed and expire after 5 minutes,
 * with a per-code attempt limit to resist brute force.
 * Replace the transport with a real SMS provider; storage moves to Redis.
 */
@Injectable()
export class OtpStore {
  private readonly store = new Map<string, OtpEntry>();

  /** Generates a 6-digit code, stores its hash, returns the plaintext for delivery. */
  issue(phone: string): string {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    this.store.set(phone, {
      codeHash: this.hash(code),
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });
    return code;
  }

  /** Returns true if the code matches and is not expired. Consumes on success. */
  verify(phone: string, code: string): boolean {
    const entry = this.store.get(phone);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt || entry.attempts >= MAX_ATTEMPTS) {
      this.store.delete(phone);
      return false;
    }

    entry.attempts += 1;

    if (this.hash(code) === entry.codeHash) {
      this.store.delete(phone);
      return true;
    }
    return false;
  }

  private hash(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }
}
