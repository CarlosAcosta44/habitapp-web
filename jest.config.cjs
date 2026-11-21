module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.tsx?$',
  transform: {
    '^.+\\.(t|j)sx?$': [
      '/home/kairos/Proyectos/habitapp-api/node_modules/ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          module: 'commonjs',
          moduleResolution: 'node',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/date-utils.ts',
    'lib/result.ts',
    'hooks/useHabitForm.ts',
    'components/registros/DailyProgress.tsx',
    'components/dashboard/StreakWidget.tsx',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

