import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // Relative asset paths allow the same build to work on GitHub Pages project URLs.
  base: './',
  plugins: [vue()],
})
