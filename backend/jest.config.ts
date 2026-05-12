import type { Config } from 'jest';

const config: Config = {
  // ts-jest compiles TypeScript on the fly — no separate build step for tests.
  preset: 'ts-jest',

  testEnvironment: 'node',

  // Where Jest looks for test files.
  testMatch: ['**/tests/**/*.test.ts'],

  // Force NODE_ENV=test so middlewares like morgan are silent.
  // Also lets us swap to a test DB if we configure one.
  setupFiles: ['<rootDir>/tests/setup.ts'],

  // Coverage thresholds enforced by the cahier (≥ 80 %).
  // Jest fails the run if any metric drops below.
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },

  // What gets included in the coverage report.
  collectCoverageFrom: [
    'src/**/*.ts',
    // Server bootstrap and config aren't tested directly.
    '!src/server.ts',
    '!src/config/env.ts',
  ],

  // Speed: tests touching the same DB cannot run in parallel without isolation.
  // We start with --runInBand (sequential) and revisit if the suite gets slow.
  maxWorkers: 1,
};

export default config;