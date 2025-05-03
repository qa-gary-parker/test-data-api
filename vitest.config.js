import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Vitest configuration options
    globals: true, // Use global APIs like describe, it, expect
    environment: 'node', // Use Node.js environment for testing API calls
    // Optional: Setup files, coverage, etc. can be added here later
  },
}); 