import { Faker, en, de, es, fr, base, it, ja, pt_BR, zh_CN } from '@faker-js/faker';

const MAX_COUNT = 50; // Set a reasonable max limit for count

// Map locale strings to faker locale objects
const supportedLocales = {
    'en': en,
    'de': de,
    'es': es,
    'fr': fr,
    'it': it,
    'ja': ja,
    'pt_br': pt_BR,
    'zh_cn': zh_CN
};

// Cache for NON-SEEDED faker instances
const nonSeededFakerInstances = {};

/**
 * Simple hash function to convert a string seed into a numeric value.
 * @param {string} str - The string seed.
 * @returns {number} A numeric hash.
 */
function simpleStringHash(str) {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Gets a locale-specific faker instance, creating it if not cached.
 * If a seed is provided, it ALWAYS creates a new seeded instance (not cached).
 * Throws an error if the requested locale is not supported.
 * @param {string} [locale='en'] - The desired locale code (e.g., 'en', 'de').
 * @param {string | number} [seed] - Optional seed value for reproducible data.
 * @returns {Faker} The faker instance for the specified locale, potentially seeded.
 * @throws {Error} If the locale is not supported.
 */
export const getFakerInstance = (locale = 'en', seed) => {
    const lowerLocale = locale.toLowerCase();

    if (lowerLocale !== 'en' && !supportedLocales[lowerLocale]) {
        throw new Error(`Unsupported locale: '${locale}'. Supported locales are: ${Object.keys(supportedLocales).join(', ')}`);
    }

    const targetLocale = supportedLocales[lowerLocale] || supportedLocales['en'];

    // If seed is provided, always create a new instance
    if (seed !== undefined) {
        console.log(`Creating new SEEDED Faker instance for locale: ${lowerLocale}, seed: ${seed}`);
        const seededFaker = new Faker({ locale: [targetLocale, en, base] });

        // Ensure seed is numeric for faker.seed()
        let numericSeed;
        const seedType = typeof seed;
        if (seedType === 'number') {
            numericSeed = seed;
        } else if (seedType === 'string') {
            const parsed = parseInt(seed, 10);
            // Use parsed number if valid, otherwise hash the string
            numericSeed = !isNaN(parsed) ? parsed : simpleStringHash(seed);
        } else {
            // Fallback for unexpected seed types - use a default or hash the input
            console.warn(`Unexpected seed type: ${seedType}. Using default seed 0.`);
            numericSeed = 0;
        }

        console.log(`Using numeric seed: ${numericSeed}`);
        seededFaker.seed(numericSeed); // Seed with the derived number
        return seededFaker;
    }

    // Otherwise, use cached instance for non-seeded requests
    if (!nonSeededFakerInstances[lowerLocale]) {
        console.log(`Creating new non-seeded Faker instance for locale: ${lowerLocale}`);
        nonSeededFakerInstances[lowerLocale] = new Faker({ locale: [targetLocale, en, base] });
    }
    return nonSeededFakerInstances[lowerLocale];
};

/**
 * Parses and validates the 'count' query parameter.
 * @param {object} c - The Hono context object.
 * @param {number} [max=MAX_COUNT] - The maximum allowed count.
 * @returns {number} The validated count (1 to max).
 * @throws {Error} If the count parameter is invalid (non-numeric, <= 0, > max).
 */
export const getCount = (c, max = MAX_COUNT) => {
    const countParam = c.req.query('count');
    let count = 1;

    if (countParam !== undefined) {
        const parsedCount = parseInt(countParam, 10);
        if (isNaN(parsedCount)) {
            throw new Error(`Invalid count parameter: '${countParam}'. Must be a number.`);
        }
        if (parsedCount <= 0) {
            throw new Error(`Invalid count parameter: '${parsedCount}'. Must be greater than 0.`);
        }
        if (parsedCount > max) {
            throw new Error(`Invalid count parameter: '${parsedCount}'. Maximum allowed count is ${max}.`);
        }
        count = parsedCount;
    }
    return count;
}; 