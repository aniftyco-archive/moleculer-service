module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tests/tsconfig.json',
    },
  },
  reporters: ['default'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageThreshold: {
    global: {
      functions: 0,
      branches: 0,
      lines: 0,
    },
  },
};
