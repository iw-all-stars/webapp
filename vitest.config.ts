/// <reference types="vitest" />

import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ["vitestSetup.ts"],
    alias: {
      '~/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
})