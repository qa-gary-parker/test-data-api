import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { unstable_dev } from 'wrangler'; // Use wrangler's dev server for integration tests
import { fetch } from 'undici'; // Use undici's fetch for making requests

// Type definition for the Worker process returned by unstable_dev
/** @type {import('wrangler').UnstableDevWorker} */
let worker;
const TEST_API_KEY = 'test-api-key'; // Key for general tests (test plan)
const FREE_TEST_API_KEY = 'free-test-key'; // Key specifically for rate limit tests (free plan)

// Test suite setup: Start the wrangler dev server before tests run
beforeAll(async () => {
    console.log("Starting wrangler dev for tests...");
    try {
        worker = await unstable_dev(
            'src/index.js', // Path to your worker script
            {
                experimental: { disableExperimentalWarning: true },
                // Optional: specify port, ip, etc. if needed
                // port: 8788, // Example: Use a different port for tests
            }
        );
        console.log(`Wrangler dev server started at http://${worker.address}:${worker.port}`);
    } catch (e) {
        console.error("Failed to start wrangler dev server:", e);
        throw e; // Rethrow to fail the test suite
    }
});

// Test suite teardown: Stop the wrangler dev server after tests finish
afterAll(async () => {
    if (worker) {
        console.log("Stopping wrangler dev server...");
        await worker.stop();
        console.log("Wrangler dev server stopped.");
    }
});

// Helper function to fetch with specific Auth header
const fetchWithAuth = (url, apiKey = TEST_API_KEY, options = {}) => {
    const headers = {
        ...options.headers,
        'X-API-Key': apiKey,
    };
    return fetch(url, { ...options, headers });
};

// --- Test Suite --- //

describe('Test Data API Endpoints', () => {

    const getBaseUrl = () => `http://${worker.address}:${worker.port}`;

    // --- Public Routes --- //
    describe('Public Routes', () => {
        it('GET /ping should return pong', async () => {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/ping`); // No auth needed
            expect(response.status).toBe(200);
            const text = await response.text();
            expect(text).toBe('pong');
        });

        it('GET / should return API documentation', async () => {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/`); // No auth needed
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.message).toBe('Test Data Generation API');
        });
    });

    // --- Protected Data Endpoints --- //
    describe('Protected Data Endpoints', () => {
        const endpoints = [
            { path: '/user', keys: ['firstName', 'lastName', 'email', 'username', 'avatar'] },
            { path: '/address', keys: ['streetAddress', 'city', 'state', 'zipCode', 'country', 'latitude', 'longitude'] },
            { path: '/payment/card', keys: ['cardType', 'cardNumber', 'cardCvv', 'cardExpiry'] },
            { path: '/company', keys: ['name', 'catchPhrase'] },
            { path: '/product', keys: ['name', 'price', 'department', 'description', 'material'] },
            { path: '/internet', keys: ['ip', 'ipv6', 'mac', 'userAgent', 'domainName', 'url'] },
            { path: '/uuid', keys: ['uuid'] },
            { path: '/profile', keys: ['user', 'address'] },
            { path: '/date', keys: ['date'] },
            { path: '/lorem', keys: ['text'] },
            { path: '/transaction', keys: ['amount', 'currencyCode', 'currencyName', 'currencySymbol', 'account', 'transactionType', 'transactionDescription'] },
            { path: '/readable_text', keys: ['text'] },
        ];

        endpoints.forEach(({ path, keys }) => {
            it(`GET ${path} should return 200 OK with valid API key`, async () => {
                const baseUrl = getBaseUrl();
                const response = await fetchWithAuth(`${baseUrl}${path}`); // Use helper
                expect(response.status).toBe(200);
                const data = await response.json();
                expect(data).toBeTypeOf('object');
                keys.forEach(key => expect(data).toHaveProperty(key));
            });

            it(`GET ${path}?count=3 should return array with valid API key`, async () => {
                const baseUrl = getBaseUrl();
                const response = await fetchWithAuth(`${baseUrl}${path}?count=3`); // Use helper
                expect(response.status).toBe(200);
                const data = await response.json();
                const dataArray = data;
                expect(Array.isArray(dataArray)).toBe(true);
                expect(dataArray.length).toBe(3);
                if (dataArray.length > 0) {
                    expect(dataArray[0]).toBeTypeOf('object');
                    keys.forEach(key => expect(dataArray[0]).toHaveProperty(key));
                }
            });

            // Locale tests (remain mostly the same, just use fetchWithAuth)
            if (!['/uuid', '/lorem', '/ping', '/', '/readable_text'].includes(path)) { // readable_text doesn't use locale param directly
                 it(`GET ${path}?locale=de should return 200 OK`, async () => {
                    const baseUrl = getBaseUrl();
                    const response = await fetchWithAuth(`${baseUrl}${path}?locale=de`);
                    expect(response.status).toBe(200);
                });
                 it(`GET ${path}?locale=it should return 200 OK`, async () => {
                    const baseUrl = getBaseUrl();
                    const response = await fetchWithAuth(`${baseUrl}${path}?locale=it`);
                    expect(response.status).toBe(200);
                });
                 // ... (ja, pt_br, zh_cn tests also need fetchWithAuth)
                 it(`GET ${path}?locale=ja should return 200 OK`, async () => {
                    const baseUrl = getBaseUrl();
                    const response = await fetchWithAuth(`${baseUrl}${path}?locale=ja`);
                    expect(response.status).toBe(200);
                 });
                 it(`GET ${path}?locale=pt_br should return 200 OK`, async () => {
                    const baseUrl = getBaseUrl();
                    const response = await fetchWithAuth(`${baseUrl}${path}?locale=pt_br`);
                    expect(response.status).toBe(200);
                 });
                 it(`GET ${path}?locale=zh_cn should return 200 OK`, async () => {
                    const baseUrl = getBaseUrl();
                    const response = await fetchWithAuth(`${baseUrl}${path}?locale=zh_cn`);
                    expect(response.status).toBe(200);
                 });
            }
        });

        // Specific readable_text context test
        it('GET /readable_text?context=technology should return 200 OK', async () => {
             const baseUrl = getBaseUrl();
             const response = await fetchWithAuth(`${baseUrl}/readable_text?context=technology`);
             expect(response.status).toBe(200);
             const data = await response.json();
             expect(data).toHaveProperty('text');
        });
    });

    describe('Authentication Errors', () => {
        it('GET /user without API key should return 401 Unauthorized', async () => {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/user`); // No Auth header
            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('GET /user with invalid API key should return 403 Forbidden', async () => {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/user`, {
                headers: { 'X-API-Key': 'invalid-key' }
            });
            expect(response.status).toBe(403);
            const data = await response.json();
            expect(data.error).toBe('Forbidden');
        });
    });

    describe('Parameter Validation Errors', () => { // Renamed from Error Handling
        it('GET /user?count=0 should return 400 Bad Request (with auth)', async () => {
            const baseUrl = getBaseUrl();
            const response = await fetchWithAuth(`${baseUrl}/user?count=0`); // Needs auth
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Bad Request');
            expect(data.message).toContain('greater than 0');
        });

        it('GET /user?count=99 should return 400 Bad Request (with auth)', async () => {
            const baseUrl = getBaseUrl();
            const response = await fetchWithAuth(`${baseUrl}/user?count=99`); // Needs auth
            expect(response.status).toBe(400);
             const data = await response.json();
            expect(data.error).toBe('Bad Request');
            expect(data.message).toContain('Maximum allowed count is 50');
        });

         it('GET /user?count=abc should return 400 Bad Request (with auth)', async () => {
            const baseUrl = getBaseUrl();
            const response = await fetchWithAuth(`${baseUrl}/user?count=abc`); // Needs auth
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Bad Request');
            expect(data.message).toContain('Must be a number');
        });

        it('GET /user?locale=xx should return 400 Bad Request (with auth)', async () => {
            const baseUrl = getBaseUrl();
            const response = await fetchWithAuth(`${baseUrl}/user?locale=xx`); // Needs auth
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Bad Request');
            expect(data.message).toContain('Unsupported locale');
        });

         it('GET /nonexistent should return 404 Not Found', async () => {
             const baseUrl = getBaseUrl();
             // Auth IS needed because /* middleware runs first.
             // Send a valid key to pass auth, then expect 404 because the route doesn't exist.
             const response = await fetchWithAuth(`${baseUrl}/nonexistent`);
             expect(response.status).toBe(404);
             // Hono's default 404 is often just text, not JSON
             // const data = await response.json(); // Might fail if not JSON
             // expect(data.error).toBe('Not Found');
         });
    });

    describe('Seeding', () => {
        it('GET /user with same seed should return identical results (with auth)', async () => {
            const baseUrl = getBaseUrl();
            const seed = 'test-seed-123';
            const response1 = await fetchWithAuth(`${baseUrl}/user?seed=${seed}`); // Needs auth
            const data1 = await response1.json();
            expect(response1.status).toBe(200);

            const response2 = await fetchWithAuth(`${baseUrl}/user?seed=${seed}`); // Needs auth
            const data2 = await response2.json();
            expect(response2.status).toBe(200);

            expect(data1).toEqual(data2);
        });

        it('GET /user with different seeds should return different results (with auth)', async () => {
            const baseUrl = getBaseUrl();
            const response1 = await fetchWithAuth(`${baseUrl}/user?seed=seed_a`); // Needs auth
            const data1 = await response1.json();
            expect(response1.status).toBe(200);

            const response2 = await fetchWithAuth(`${baseUrl}/user?seed=seed_b`); // Needs auth
            const data2 = await response2.json();
            expect(response2.status).toBe(200);

            expect(data1).not.toEqual(data2);
        });

         it('GET /user without seed should return different results on subsequent calls (with auth)', async () => {
            const baseUrl = getBaseUrl();
            const response1 = await fetchWithAuth(`${baseUrl}/user`); // Needs auth
            const data1 = await response1.json();
            expect(response1.status).toBe(200);

            const response2 = await fetchWithAuth(`${baseUrl}/user`); // Needs auth
            const data2 = await response2.json();
            expect(response2.status).toBe(200);

            expect(data1).not.toEqual(data2);
        });
    });

    describe('Rate Limiting', () => {
        const rlTestPath = '/product';
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const FREE_PLAN_LIMIT = 5;
        const fetchWithFreeKey = (url, options = {}) => fetchWithAuth(url, FREE_TEST_API_KEY, options);
        const rateLimitKeyToClear = FREE_TEST_API_KEY;

        // Clear the rate limit KV entry using the test API endpoint before each rate limit test
        beforeEach(async () => {
            const baseUrl = getBaseUrl();
            const cleanupUrl = `${baseUrl}/test/rate-limit/${rateLimitKeyToClear}`;
            console.log(`[Test Setup] Calling cleanup endpoint: ${cleanupUrl}`);
            try {
                // Use the standard TEST_API_KEY (with high rate limit) to call the cleanup endpoint
                const response = await fetchWithAuth(cleanupUrl, TEST_API_KEY, { method: 'DELETE' });
                if (!response.ok) {
                    const errorText = await response.text();
                     console.error(`[Test Setup] Failed to clear rate limit key via API. Status: ${response.status}, Response: ${errorText}`);
                    // Optionally throw an error to fail the test if cleanup is critical
                    // throw new Error(`Failed to clear rate limit key ${rateLimitKeyToClear}`);
                } else {
                     console.log(`[Test Setup] Successfully cleared rate limit key ${rateLimitKeyToClear} via API.`);
                     // Ensure the response body is consumed
                     await response.json();
                }
            } catch (e) {
                 console.error('[Test Setup] Error calling cleanup endpoint:', e);
                 // Optionally throw
            }
        });

        it('should allow requests within the limit (free plan)', async () => {
            const baseUrl = getBaseUrl();
            const limit = FREE_PLAN_LIMIT;
            const promises = [];
            for (let i = 0; i < limit; i++) {
                promises.push(fetchWithFreeKey(`${baseUrl}${rlTestPath}?i=${i}`)); // Use free key
            }
            const responses = await Promise.all(promises);
            responses.forEach(response => {
                expect(response.status, `Request failed within free plan limit`).toBe(200);
            });
        });

        it('should return 429 Too Many Requests when limit is exceeded (free plan)', async () => {
            const baseUrl = getBaseUrl();
            const limit = FREE_PLAN_LIMIT;
            // Make requests sequentially to ensure KV updates
            for (let i = 0; i < limit; i++) {
                 const res = await fetchWithFreeKey(`${baseUrl}${rlTestPath}?i=${i}_exceed_free`); // Use free key
                 expect(res.status).toBe(200);
            }

            // The next request should be rate limited
            const response = await fetchWithFreeKey(`${baseUrl}${rlTestPath}?i=exceeded_free`); // Use free key
            expect(response.status).toBe(429);
            const data = await response.json();
            expect(data.error).toBe('Too Many Requests');
            expect(response.headers.get('retry-after')).toBeDefined();
        });

        it('should reset the limit after the window expires (free plan)', { timeout: 65000 }, async () => {
            const baseUrl = getBaseUrl();
            const limit = FREE_PLAN_LIMIT;
            // Ensure limit is hit (sequential requests)
             for (let i = 0; i < limit; i++) { // Hit the exact limit first
                  const res = await fetchWithFreeKey(`${baseUrl}${rlTestPath}?i=reset_free_${i}`);
                  // Need to check status here or the test might proceed even if setup failed
                  expect(res.status).toBe(200);
             }
            // This one should be blocked
            const responseLimited = await fetchWithFreeKey(`${baseUrl}${rlTestPath}?i=reset_free_limited`);
            expect(responseLimited.status).toBe(429);

            console.log(`Rate limit (free plan) hit, waiting for window to reset (61s)...`);
            await sleep(61 * 1000); // Wait for the 60s window + 1s buffer

            console.log('Window should have reset, attempting request...');
            const responseAfterReset = await fetchWithFreeKey(`${baseUrl}${rlTestPath}?i=reset_free_after`);
            expect(responseAfterReset.status, 'Request failed after rate limit window reset (free plan)').toBe(200);
        });
    });

}); 