# UI 调试检查清单

## ✅ 服务器状态
- ✅ 前端服务器：http://localhost:5173 (运行中)
- ✅ 后端服务器：http://localhost:8787 (运行中)

## 🔍 发现的问题

### 1. 缺失的 API 端点
**问题：** 前端代码调用了 `/api/weather` 端点，但后端尚未实现。

**位置：**
- 前端：`src/utils/api.ts` - `getWeekendWeather()` 函数
- 前端：`src/components/Planner/SelectionPanel.tsx` - 使用 `getWeekendWeather()`

**当前后端端点：**
- ✅ `/api/chat` - GraphQL 聊天端点（已实现）

**需要实现的后端端点：**
- ❌ `/api/weather?city=杭州` - 天气查询端点（未实现）

### 2. API 调用测试

#### 测试聊天 API（应该工作）
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

#### 测试天气 API（当前会失败）
```bash
curl "http://localhost:8787/api/weather?city=杭州"
# 预期：404 Not Found（因为端点未实现）
```

## 🛠️ Chrome DevTools 调试步骤

### 1. 打开应用
在浏览器中访问：http://localhost:5173

### 2. 打开 Chrome DevTools
- 按 `F12` 或 `Cmd+Option+I` (Mac)
- 或右键点击页面 → "检查"

### 3. 检查 Network 标签

#### 检查天气 API 请求
1. 打开 **Network** 标签
2. 选择城市（如"杭州"）
3. 查看是否有 `/api/weather` 请求
4. **预期结果：** 请求会失败（404 或连接错误）

#### 检查聊天 API 请求
1. 选择城市和出行类别
2. 点击"生成周末方案"按钮
3. 查看 `/api/chat` 请求
4. **预期结果：** 请求应该成功（如果 OpenAI API Key 配置正确）

### 4. 检查 Console 标签

#### 查看错误信息
打开 **Console** 标签，查看是否有以下错误：
- `Failed to fetch weather data` - 天气 API 未实现
- `CORS error` - 跨域问题
- `GraphQL error` - API 请求格式错误

#### 测试 API 连接
在 Console 中运行以下代码：

```javascript
// 测试天气 API（预期会失败）
fetch('/api/weather?city=杭州')
  .then(r => {
    console.log('Status:', r.status);
    return r.text();
  })
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));

// 测试聊天 API（应该工作）
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

### 5. 检查应用状态

#### 查看 localStorage
在 Console 中运行：
```javascript
// 查看保存的应用状态
const store = localStorage.getItem('weekend-planner-store');
console.log('Planner Store:', JSON.parse(store || '{}'));
```

#### 检查 React 组件状态
如果安装了 React DevTools：
1. 打开 **React DevTools** 标签
2. 选择 `<App>` 组件
3. 查看 `usePlannerStore` 的状态
4. 检查以下状态：
   - `city` - 当前选择的城市
   - `planType` - 当前选择的出行类别
   - `weekendInfo` - 周末天气信息（可能为空）
   - `isLoadingWeather` - 是否正在加载天气
   - `error` - 错误信息

### 6. UI 功能测试

#### 基础功能测试
- [ ] 页面正常加载
- [ ] 城市选择器下拉菜单工作正常
- [ ] 出行类别按钮（旅游/运动）点击正常
- [ ] 主题切换按钮工作正常

#### 天气功能测试
- [ ] 选择城市后，触发天气 API 请求
- [ ] 查看 Network 标签中的 `/api/weather` 请求
- [ ] **预期：** 请求失败（404），因为后端未实现
- [ ] **当前行为：** 前端会显示模拟数据（见 `src/utils/api.ts` 的 fallback）

#### 方案生成功能测试
- [ ] 选择城市和出行类别
- [ ] 点击"生成周末方案"按钮
- [ ] 查看 Network 标签中的 `/api/chat` 请求
- [ ] **预期：** 请求成功，返回方案列表
- [ ] 检查方案卡片是否正确显示

#### 时间线生成功能测试
- [ ] 选择一个方案
- [ ] 点击"生成时间线"按钮
- [ ] 查看 Network 标签中的 `/api/chat` 请求
- [ ] **预期：** 请求成功，返回时间线数据
- [ ] 检查时间线是否正确显示

## 📝 调试记录模板

### 测试日期：___________

#### 网络请求记录
| 请求 | 状态码 | 响应时间 | 结果 |
|------|--------|----------|------|
| `/api/weather?city=杭州` | ___ | ___ms | ❌/✅ |
| `/api/chat` (生成方案) | ___ | ___ms | ❌/✅ |
| `/api/chat` (生成时间线) | ___ | ___ms | ❌/✅ |

#### 控制台错误
```
[在此记录控制台中的错误信息]
```

#### UI 问题
```
[在此记录 UI 显示问题]
```

## 🔧 下一步行动

1. **实现天气 API 端点**
   - 根据 `backend-plan.md` 实现 `dateWeatherTool`
   - 创建 `/api/weather` 端点

2. **检查 OpenAI API Key 配置**
   - 确保后端环境变量中配置了 `OPENAI_API_KEY`
   - 检查 `.dev.vars` 文件（本地开发）

3. **实现 Mastra Agent**
   - 根据 `backend-plan.md` 实现 Mastra Agent
   - 集成三个工具：`dateWeatherTool`、`sportsVenueTool`、`travelPlanTool`

## 📚 相关文件

- 前端 API 调用：`src/utils/api.ts`
- 前端组件：`src/components/Planner/SelectionPanel.tsx`
- 后端 API：`functions/api/chat.ts`
- 后端计划：`backend-plan.md`
- 调试指南：`DEBUG_GUIDE.md`

