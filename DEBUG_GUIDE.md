# UI 调试指南

## 服务器状态
- ✅ 前端服务器：http://localhost:5173
- ✅ 后端服务器：http://localhost:8787

## 手动调试步骤

### 1. 打开应用
在浏览器中访问：http://localhost:5173

### 2. 打开 Chrome DevTools
- 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
- 或右键点击页面 → "检查"

### 3. 检查的关键点

#### 网络请求检查
1. 打开 **Network** 标签
2. 刷新页面
3. 检查以下请求：
   - `/api/weather?city=杭州` - 天气 API 请求
   - `/api/chat` - 聊天 API 请求（生成方案时）

#### 控制台检查
1. 打开 **Console** 标签
2. 查看是否有错误信息
3. 常见错误：
   - CORS 错误
   - API 连接失败
   - 解析错误

#### 应用状态检查
在 Console 中运行以下代码检查应用状态：

```javascript
// 检查 localStorage 中的状态
console.log('Planner Store:', JSON.parse(localStorage.getItem('weekend-planner-store')));

// 检查 React 组件状态（如果使用 React DevTools）
// 需要安装 React DevTools 扩展
```

### 4. 功能测试清单

#### 基础功能
- [ ] 页面正常加载
- [ ] 城市选择器工作正常
- [ ] 出行类别选择（旅游/运动）工作正常
- [ ] 天气信息显示正常

#### API 集成测试
- [ ] 选择城市后，天气 API 请求成功
- [ ] 点击"生成周末方案"按钮，API 请求成功
- [ ] 选择方案后，生成时间线 API 请求成功

#### UI 交互测试
- [ ] 主题切换（深色/浅色模式）工作正常
- [ ] 方案选择卡片点击正常
- [ ] 时间线显示正常
- [ ] 提问对话框工作正常

### 5. 常见问题排查

#### 问题：天气信息不显示
**检查：**
1. Network 标签中 `/api/weather` 请求是否成功
2. 响应状态码是否为 200
3. 响应数据格式是否正确

**调试代码：**
```javascript
// 在 Console 中测试天气 API
fetch('/api/weather?city=杭州')
  .then(r => r.json())
  .then(data => console.log('Weather Data:', data))
  .catch(err => console.error('Weather Error:', err));
```

#### 问题：生成方案失败
**检查：**
1. Network 标签中 `/api/chat` 请求是否成功
2. 请求体格式是否正确（GraphQL 格式）
3. 后端服务是否正常运行

**调试代码：**
```javascript
// 在 Console 中测试聊天 API
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `mutation Chat($messages: [MessageInput!]!) {
      chat(messages: $messages) {
        content
      }
    }`,
    variables: {
      messages: [{ role: 'user', content: '测试消息' }]
    }
  })
})
  .then(r => r.json())
  .then(data => console.log('Chat Response:', data))
  .catch(err => console.error('Chat Error:', err));
```

#### 问题：CORS 错误
**检查：**
1. 后端服务是否正确配置 CORS
2. 前端代理配置是否正确（vite.config.ts）

### 6. React DevTools 调试

如果安装了 React DevTools 扩展：
1. 打开 React DevTools 标签
2. 选择 `<App>` 组件
3. 查看组件状态和 props
4. 检查 `usePlannerStore` 的状态

### 7. 性能分析

使用 Chrome DevTools Performance 标签：
1. 点击"录制"按钮
2. 执行一些操作（选择城市、生成方案等）
3. 停止录制
4. 查看性能分析结果

### 8. 断点调试

在源代码中设置断点：
1. 打开 **Sources** 标签
2. 找到 `src/` 目录下的文件
3. 设置断点
4. 刷新页面或执行操作
5. 查看变量值和调用栈

## 后端 API 测试

### 测试天气 API
```bash
curl "http://localhost:8787/api/weather?city=杭州"
```

### 测试聊天 API
```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Chat($messages: [MessageInput!]!) { chat(messages: $messages) { content } }",
    "variables": {
      "messages": [{"role": "user", "content": "测试消息"}]
    }
  }'
```

## 有用的 Chrome DevTools 快捷键

- `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows) - 打开 DevTools
- `Cmd+Option+J` (Mac) / `Ctrl+Shift+J` (Windows) - 打开 Console
- `Cmd+Option+C` (Mac) / `Ctrl+Shift+C` (Windows) - 选择元素
- `Cmd+R` (Mac) / `Ctrl+R` (Windows) - 刷新页面
- `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows) - 硬刷新（清除缓存）

