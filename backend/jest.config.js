module.exports = {
  // Répertoires à inclure dans les tests
  roots: ['<rootDir>/tests'],
  
  // Extensions de fichiers à traiter
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  
  // Chemins à ignorer lors des tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.git/'
  ],
  
  // Configuration pour les fichiers de test
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Configuration de la couverture de code
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!jest.config.js',
    '!**/migrations/**',
    '!**/seeders/**',
    '!**/config/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Configuration pour les fichiers de test
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  
  // Configuration pour les modules
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@controllers/(.*)$': '<rootDir>/controllers/$1',
    '^@routes/(.*)$': '<rootDir>/routes/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Configuration pour les fichiers de test
  testEnvironment: 'node',
  
  // Configuration pour les transformations
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest'
  },
  
  // Configuration pour les fichiers à ignorer
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  
  // Configuration pour les rapports de test
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
    }],
  ],
  
  // Configuration pour les hooks de test
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
  
  // Configuration pour les tests en parallèle
  maxWorkers: '50%',
  
  // Configuration pour les watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Configuration pour les timeouts
  testTimeout: 30000,
  
  // Configuration pour les snapshots
  snapshotSerializers: ['jest-serializer-path'],
  
  // Configuration pour les rapports de couverture
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ]
};
