const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds

// Define limits per plan (requests per window)
const PLAN_LIMITS = {
    test: 1000, // Ensure limit is high for general tests
    free: 5,    // Keep low for specific rate limit tests
    pro: 100,
    default: 5 // Fallback if plan is missing or unknown
};

/**
 * Rate limiting middleware using KV.
 * Assumes authMiddleware has run first and attached apiKeyData to context.
 */
export const rateLimitMiddleware = async (c, next) => {
    const apiKey = c.req.header('x-api-key');
    if (!apiKey) {
        // Let auth handle missing keys.
        return await next();
    }

    const apiKeyData = c.get('apiKeyData');
    const plan = apiKeyData?.plan || 'default';
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.default;
    const kvNamespace = c.env.API_KEYS;

    if (!kvNamespace) {
         console.error('Rate Limiter Error: API_KEYS KV namespace binding is missing.');
         return c.json({ error: 'Internal Server Error', message: 'Server configuration error.' }, 500);
    }

    const key = `rate_limit:${apiKey}`;
    const now = Date.now();

    try {
        const storedValue = await kvNamespace.get(key, { type: 'json' });
        let currentCount = 0;
        let windowStart = now;

        if (storedValue) {
            const timeElapsed = now - storedValue.windowStart;
            if (timeElapsed < RATE_LIMIT_WINDOW_MS) {
                windowStart = storedValue.windowStart;
                currentCount = storedValue.count;
            } else {
                windowStart = now;
                currentCount = 0;
            }
        } else {
            windowStart = now;
            currentCount = 0;
        }

        if (currentCount >= limit) {
            const timeRemaining = RATE_LIMIT_WINDOW_MS - (now - windowStart);
            const retryAfterSeconds = Math.max(1, Math.ceil(timeRemaining / 1000));

            return c.json(
                { error: 'Too Many Requests', message: `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.` },
                429,
                { 'Retry-After': retryAfterSeconds.toString() }
            );
        }

        const newCount = currentCount + 1;
        const newValue = JSON.stringify({ windowStart, count: newCount });
        const expirationTtl = Math.ceil((RATE_LIMIT_WINDOW_MS * 1.5) / 1000);
        await kvNamespace.put(key, newValue, { expirationTtl });

        await next();

    } catch (error) {
         console.error('Rate Limiter Middleware Error:', error);
         return c.json({ error: 'Internal Server Error', message: 'An error occurred during rate limiting.' }, 500);
    }
}; 