import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set VITE_BASE='/eval/' when deploying to GitHub Pages under /<owner>/eval/
// Defaults to '/' for Vercel / Netlify / local dev
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/',
})
