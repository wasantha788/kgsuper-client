import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' 
import { fileURLToPath } from 'url'


// Necessary for __dirname to work in ESM (Vite's default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // This tells Vite that "@" refers to your "src" directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
})