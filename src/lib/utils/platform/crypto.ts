/**
 * Crypto Platform Adapter - Web Implementation
 *
 * Uses the Web Crypto API for cryptographically secure random number generation
 */

export interface CryptoAdapter {
  /**
   * Generates a cryptographically secure random seed
   * Used for initializing the game's deterministic RNG
   *
   * @returns A random 32-bit unsigned integer
   */
  generateSecureRandomSeed(): number;

  /**
   * Fills a typed array with cryptographically secure random values
   *
   * @param array - The typed array to fill with random values
   */
  getRandomValues<T extends Uint8Array | Uint16Array | Uint32Array>(array: T): T;
}

class WebCryptoAdapter implements CryptoAdapter {
  generateSecureRandomSeed(): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0]!;
  }

  getRandomValues<T extends Uint8Array | Uint16Array | Uint32Array>(array: T): T {
    crypto.getRandomValues(array);
    return array;
  }
}

export const cryptoAdapter: CryptoAdapter = new WebCryptoAdapter();
