import { defineConfig } from 'vite'
import path from "path";
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('md-')
        }
      }
    })
  ],
  server: {
    port: 3000
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@assets', replacement: path.resolve(__dirname, './src/assets') },
      { find: '@views', replacement: path.resolve(__dirname, './src/views') },
      { find: '@scss', replacement: path.resolve(__dirname, './src/scss') },
      { find: '@composables', replacement: path.resolve(__dirname, './src/composables') },
    ]
  },
})
