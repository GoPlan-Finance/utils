/*
 * Jest configuration for integration tests that run against a real Parse Server
 * backed by an in-memory MongoDB (mongodb-memory-server).
 *
 * These are intentionally separate from the unit specs (jest.config.ts): they are
 * slower and pull in heavy dev dependencies, so they run via `yarn test:integration`
 * and are excluded from the default `yarn test` run.
 */
import { pathsToModuleNameMapper } from 'ts-jest';
import tsConfigFile from './tsconfig.json';

export default {
  clearMocks: true,
  collectCoverage: false,
  coverageProvider: 'v8',
  rootDir: process.cwd(),
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>/src'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsConfigFile.compilerOptions.paths, { prefix: __dirname }),
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  globalSetup: '<rootDir>/spec/integration/globalSetup.ts',
  globalTeardown: '<rootDir>/spec/integration/globalTeardown.ts',
  setupFiles: ['<rootDir>/spec/integration/jestSetup.ts'],
  testMatch: ['<rootDir>/spec/integration/**/*.itest.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // A fresh MongoMemoryServer + Parse Server is started per suite; give it room.
  testTimeout: 60000,
};
