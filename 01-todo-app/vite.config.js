import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The deploy workflow uploads this app's dist/ as the Pages artifact, and
// GitHub Pages always serves an uploaded artifact at the repo's site root
// (/vibe-coding-lab/), regardless of which subfolder it was built from.
// Local dev stays at '/' since the CI workflow is the only place that sets
// this env var.
const base = process.env.GITHUB_PAGES ? '/vibe-coding-lab/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
