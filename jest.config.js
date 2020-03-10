module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['<rootDir>/services/**/tests/**/*.spec.ts', '<rootDir>/services/**/tests/**/*.spec.tsx'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
  reporters: ['default'],
  collectCoverageFrom: ['<rootDir>/services/**/src/**/*.ts'],
  coverageThreshold: {
    global: {
      functions: 0,
      branches: 0,
      lines: 0,
    },
  },
};
