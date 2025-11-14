# Cloudflare Pages 配置指南

## 配置 Workers 后端服务

### 方法 1: 使用环境变量（推荐）

1. **在 Cloudflare Dashboard 中配置环境变量：**
   - 进入你的 Pages 项目
   - 进入 Settings → Environment Variables
   - 添加环境变量：
     - **变量名**: `VITE_WORKERS_URL`
     - **值**: 你的 Workers URL（例如：`https://your-worker.your-subdomain.workers.dev`）
     - **环境**: Production 和 Preview

2. **重新部署 Pages：**
   - 环境变量更改后需要重新部署才能生效
   - 可以触发一次新的部署

### 方法 2: 使用 Pages Functions 代理（如果 Workers 和 Pages 在同一账户）

如果你使用 Cloudflare Pages Functions，可以创建一个代理函数：

创建文件：`functions/api/[...path].ts`

```typescript
export async function onRequest(context: {
  request: Request;
  env: {
    WORKERS_URL: string;
  };
}) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 获取 Workers URL
  const workersUrl = env.WORKERS_URL || 'https://your-worker.your-subdomain.workers.dev';
  
  // 构建目标 URL
  const targetUrl = `${workersUrl}${url.pathname}${url.search}`;
  
  // 转发请求
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  
  // 返回响应（处理 CORS）
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

然后在 Cloudflare Dashboard 中设置：
- **变量名**: `WORKERS_URL`
- **值**: 你的 Workers URL

### 方法 3: 直接使用 Workers URL（最简单）

如果 Workers 已经配置了 CORS，可以直接修改代码使用 Workers URL。

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

