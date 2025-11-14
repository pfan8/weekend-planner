# Cloudflare Pages 配置指南

## 配置 Workers 后端服务

### 直接使用 Workers URL（当前方案）

前端代码直接请求 Workers 域名：`https://weekend-planner-agent.pfan4remote.workers.dev`

**配置说明：**
- 前端代码已硬编码 Workers URL
- 开发环境：使用相对路径 `/api/*`（由 Vite 代理到 `localhost:8787`）
- 生产环境：直接请求 Workers URL

**重要：** 确保你的 Workers 已配置 CORS，允许来自 Pages 域名的请求。

## Workers CORS 配置

确保你的 Workers 允许来自 Pages 域名的请求：

```typescript
// 在你的 Workers 代码中添加 CORS 处理
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 或指定你的 Pages 域名
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 处理 OPTIONS 预检请求
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// 在响应中添加 CORS 头
return new Response(JSON.stringify(data), {
  headers: {
    ...corsHeaders,
    'Content-Type': 'application/json',
  },
});
```

## 本地开发

本地开发时，Vite 会自动代理 `/api/*` 请求到 `http://localhost:8787`。

如果需要使用远程 Workers，创建 `.env.local` 文件：

```bash
VITE_WORKERS_URL=https://your-worker.your-subdomain.workers.dev
```

## 验证配置

部署后，打开浏览器控制台，检查 API 请求是否指向正确的 Workers URL。

