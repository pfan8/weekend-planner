# Cloudflare Pages 配置指南

## 配置 Workers 后端服务

### 方法 1: 使用 Pages Functions 代理（推荐，当使用 wrangler.toml 作为配置源时）

**重要说明：** 当你的项目使用 `wrangler.toml` 作为配置源时，Dashboard 中只能配置 Secrets（加密变量）。所有普通环境变量必须在 `wrangler.toml` 中配置。

**解决方案：** 使用 Pages Functions 代理，将 Workers URL 配置为运行时环境变量。

1. **在 `wrangler.toml` 中配置 Workers URL：**
   ```toml
   [vars]
   WORKERS_URL = "https://your-worker.your-subdomain.workers.dev"
   ```

2. **Pages Functions 代理已配置：**
   - 文件 `functions/api/[...path].ts` 会自动将所有 `/api/*` 请求代理到 Workers
   - 前端代码使用相对路径 `/api/*`，无需配置 `VITE_WORKERS_URL`

3. **重新部署 Pages：**
   - 修改 `wrangler.toml` 后需要重新部署才能生效
   - 可以触发一次新的部署

**优势：**
- 所有配置都在 `wrangler.toml` 中，便于版本控制
- 不需要在 Dashboard 中配置普通环境变量
- 支持不同环境（production/preview）使用不同的 Workers URL

### 方法 2: 为不同环境配置不同的 Workers URL

你可以在 `wrangler.toml` 中为不同环境配置不同的 Workers URL：

```toml
[vars]
WORKERS_URL = "https://weekend-planner-agent.pfan4remote.workers.dev"

[env.production]
vars = { 
  ENVIRONMENT = "production",
  WORKERS_URL = "https://weekend-planner-agent.pfan4remote.workers.dev"
}

[env.preview]
vars = { 
  ENVIRONMENT = "preview",
  WORKERS_URL = "https://weekend-planner-agent-preview.pfan4remote.workers.dev"
}
```

### 方法 3: 直接使用 Workers URL（不推荐，需要 CORS 配置）

如果不想使用代理，可以直接在前端代码中使用 Workers URL。但这需要 Workers 配置 CORS，并且需要在 Dashboard 中配置 Secrets 或使用构建时环境变量。

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

