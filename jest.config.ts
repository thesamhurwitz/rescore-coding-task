import path from 'path';
const rootDirectory = path.resolve(__dirname);

export default {
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    },
  },
  rootDir: rootDirectory,
  roots: [rootDirectory],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/build',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: ['((/test/.*)|(\\.|/)(test|spec))\\.tsx?$'],
};
