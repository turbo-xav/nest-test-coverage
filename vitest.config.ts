import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`. Requires Vite 8, which ships this option.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    // Unit and e2e tests run as two projects so a single run can produce one
    // merged coverage report. Select one with `--project unit` or `--project e2e`.
    projects: [
      { extends: true, test: { name: 'unit', include: ['**/*.spec.ts'] } },
      { extends: true, test: { name: 'e2e', include: ['**/*.e2e-spec.ts'] } },
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts'],
      reporter: [['text', { skipFull: false }], 'html', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
});
