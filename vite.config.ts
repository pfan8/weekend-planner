import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // server 配置只在开发模式（vite dev）时生效，不会影响生产构建
  // 在生产环境中，Cloudflare Pages Functions 会自动处理 /api/* 路由
  const isDev = command === 'serve'
  
  return {
    plugins: [react()],
    // 仅在开发模式下配置代理
    ...(isDev && {
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:8787',
            changeOrigin: true,
            rewrite: (path) => path,
          },
        },
      },
    }),
  }
})
