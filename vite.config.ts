import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './',
  resolve: {
    alias: {
      '$lib': '/src/lib',
    },
  },
});
