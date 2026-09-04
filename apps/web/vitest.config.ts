import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Mirrors the "@/*" path alias from tsconfig, so a module under test can
  // import the way the app does.
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    include: ['src/**/*.spec.ts'],
  },
});
