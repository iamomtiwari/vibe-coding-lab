import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves this project at /vibe-coding-lab/01-todo-app/, so the
// production build needs that base path baked into asset URLs. Local dev
// stays at '/' since the CI workflow is the only place that sets this env var.
const base = process.env.GITHUB_PAGES ? '/vibe-coding-lab/01-todo-app/' : '/'

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
