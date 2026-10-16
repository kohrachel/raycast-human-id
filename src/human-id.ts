import { getRandomValues } from "node:crypto";
import { adjectives, adverbs, nouns, verbs } from "./words";

export const MIN_WORDS = 3;
export const MAX_WORDS = 5;
export const DEFAULT_WORDS = 4;

// Masks for the power-of-two list sizes (see words.ts).
const ADJ = 511;
const NOUN = 511;
const VERB = 255;
const ADV = 127;

// Random words are drawn from the OS CSPRNG in bulk and handed out one at a
// time, so a call costs an array read instead of a syscall. Refilling is a
// fixed-size operation, so generation stays O(1).
const POOL_SIZE = 256;
const pool = new Uint32Array(POOL_SIZE);
let cursor = POOL_SIZE;

function random32(): number {
  if (cursor === POOL_SIZE) {
    getRandomValues(pool);
    cursor = 0;
  }
  return pool[cursor++];
}

/**
 * Generate a kebab-cased, human-readable ID.
 *
 *   3 words: adjective-noun-verb                    2^26 ≈ 67 million
 *   4 words: adjective-noun-verb-adverb             2^33 ≈ 8.6 billion
 *   5 words: adjective-adjective-noun-verb-adverb   2^42 ≈ 4.4 trillion
 *
 * One 32-bit random value covers adjective (9 bits), noun (9) and verb (8);
 * a second one covers the adverb (7) and the extra adjective (9).
 */
export function humanId(wordCount: number = DEFAULT_WORDS): string {
  const a = random32();
  const adjective = adjectives[a & ADJ];
  const noun = nouns[(a >>> 9) & NOUN];
  const verb = verbs[(a >>> 18) & VERB];

  switch (wordCount) {
    case 3:
      return `${adjective}-${noun}-${verb}`;
    case 4: {
      const b = random32();
      return `${adjective}-${noun}-${verb}-${adverbs[b & ADV]}`;
    }
    case 5: {
      const b = random32();
      return `${adjective}-${adjectives[(b >>> 7) & ADJ]}-${noun}-${verb}-${adverbs[b & ADV]}`;
    }
    default:
      throw new RangeError(`wordCount must be between ${MIN_WORDS} and ${MAX_WORDS}, got ${wordCount}`);
  }
}
