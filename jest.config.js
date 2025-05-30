// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transform: {
      '^.+\\.tsx?$': ['ts-jest', {
        tsconfig: 'tsconfig.jest.json',
      }],
    },
    // ESMモジュールを変換対象に含める設定
    transformIgnorePatterns: [
      '/node_modules/(?!(@octokit|@tanstack))',
    ],
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/types/**/*',
      '!src/**/*.stories.{ts,tsx}',
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    // Hasteモジュールの衝突を防ぐためにdocディレクトリを無視
    testPathIgnorePatterns: [
      '/node_modules/',
      '/.next/',
      '/doc/'
    ],
    moduleFileExtensions: [
      'ts',
      'tsx',
      'js',
      'jsx',
      'json'
    ],
    // Hasteマップの衝突を明示的に解決
    watchPathIgnorePatterns: [
      '<rootDir>/doc/'
    ],
    modulePathIgnorePatterns: [
      '<rootDir>/doc/'
    ],
    // ルートディレクトリの明示的な指定
    rootDir: '.',
  };