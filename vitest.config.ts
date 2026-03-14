import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Basic Vitest configuration for the admin-panel-test-project.
 *
 * Notes:
 * - Uses the jsdom environment to run React component tests.
 * - Enables globals (so you can use `describe`, `it`, `expect` without imports).
 * - Points to `src/setupTests.ts` for global test setup (create this file to register testing-library matchers, mocks, etc).
 * - Includes common coverage configuration (c8 provider, text + lcov reporters).
 * - Adds a simple alias `@` -> `src` to make imports cleaner in tests and source files.
 */

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // A file that will be executed before running the tests (useful to configure testing-library, mocks, etc).
    setupFiles: 'src/setupTests.ts',
    // Which files Vitest should consider tests
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Increase default timeout for slower environments if needed
    timeout: 5000,
    // Coverage configuration
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov'],
      // include all source files for coverage metrics
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/types.ts'],
    },
    // Enable DOM snapshot serializer if you use snapshot testing with React
    // (uncomment if using @testing-library/react's pretty DOM serializers)
    // serializers: [],
  },

  // Vite resolve aliases that also apply to tests
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
})
