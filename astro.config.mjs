// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://tahzeer.github.io',
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: true, // Enable polling for file changes
      },
    },
  }
});