import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ✅ Import React plugin
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), // ✅ Add React plugin
    tailwindcss(),
  ],
})
