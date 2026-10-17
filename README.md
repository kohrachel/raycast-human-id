# Human ID

Raycast extension that generates unique, human-readable, kebab-case IDs. Inspired by [human-id](https://github.com/RienNeVaPlus/human-id).

Examples:

```
ripe-llama-acts                      3 words
fluffy-ivy-flies-busily              4 words (default)
equal-rusty-marmot-rides-politely    5 words
```

# Usage

Run **Generate Human ID**, optionally pick a word count (3–5). The ID is copied to your clipboard.

## How it works

- Word lists are hardcoded arrays (`src/words.ts`): 512 adjectives, 512 nouns, 256 verbs, 128 adverbs. Words are lowercase a–z.
- Every list length is a power of two. Each index is a bit mask over random bits, so a lookup is a single O(1) array read with no modulo bias.
- Each ID comes from a single 64-bit random value (`BigUint64Array`), sliced into word indices with shifts and masks. Random values come from `crypto.getRandomValues`.
- Generation is O(1): a fixed number of array reads and one template string. It takes about 100–170 ns per call (`npm run bench`).

## Uniqueness

| Words | Pattern                              | Combinations | ~50% chance of any collision after |
| ----- | ------------------------------------ | ------------ | ---------------------------------- |
| 3     | adjective-noun-verb                  | 2^26 ≈ 67M   | ~9,600 IDs                         |
| 4     | adjective-noun-verb-adverb           | 2^33 ≈ 8.6B  | ~109,000 IDs                       |
| 5     | adjective-adjective-noun-verb-adverb | 2^42 ≈ 4.4T  | ~2.5M IDs                          |

## Development

```bash
npm install
npm run dev     # load into Raycast in development mode
npm test        # word-list invariants, format, coverage, collisions
npm run bench
```
