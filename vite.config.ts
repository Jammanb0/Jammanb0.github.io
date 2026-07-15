import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  // If you deploy this as a project page (username.github.io/repo-name),
  // change base to '/repo-name/'. For a username.github.io user page, keep '/'.
  base: '/',
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
