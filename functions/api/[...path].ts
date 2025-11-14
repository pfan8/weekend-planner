/**
 * Pages Functions 代理
 * 将所有 /api/* 请求代理到 Workers 后端服务
 */
export async function onRequest(context: {
  request: Request;
  env: {
    WORKERS_URL: string;
  };
}) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 获取 Workers URL
  const workersUrl = env.WORKERS_URL;
  if (!workersUrl) {
    return new Response(
      JSON.stringify({ error: "WORKERS_URL not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  // 构建目标 URL（保留路径和查询参数）
  const targetUrl = `${workersUrl}${url.pathname}${url.search}`;
  
  try {
    // 转发请求到 Workers
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // 创建响应头，添加 CORS 支持
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    
    // 处理 OPTIONS 预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers,
      });
    }
    
    // 返回响应
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to proxy request",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

