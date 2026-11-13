# CHANGELOG

## 2026-11-13

### 新增
- 鉴权体系：`src/lib/auth.ts`（HMAC token + 密码哈希 + 鉴权中间件）+ `/api/auth`（注册/登录/登出/会话恢复）
- App 端 `services/apiClient.ts`：统一 HTTP 客户端，`EXPO_PUBLIC_API_URL` 配置 + Bearer token 自动携带
- App 端 3 个新 store：`auth-store`（会话持久化）/`checkin-store`（对齐后端真实契约）/`babybag-store`（服务器版待产包）

### 修复（3 处致命问题）
- **API 零鉴权**：16 个 API 路由全部改用 `getAuthUserId(request)` 从 token 取 userId，不再信任客户端传入参数
- **越权漏洞**：`[id]` 路由（fetal-movements/prenatal-visits/babybag）补归属校验，任意 id 可删他人数据 → 404/403
- **App 原生端联网全断**：3 个健康组件相对路径 `fetch('/api/...')` 全部改走 apiClient
- **RN 存储崩坏**：4 个 zustand persist 存储 `localStorage` → `AsyncStorage`
- CheckInScreen 调用的缺失方法补齐；Onboarding 完成时静默注册设备账号；App 启动会话恢复

### 优化
- 错误响应语义化（401 未登录 / 403 无权 / 404 不存在）

### 自测
- 11 项端到端验证全部通过：注册、重复注册 409、登录、错密码 401、无 token 401、伪造 token 401、越权删除 404、打卡读写、胎动读写、会话恢复
- 生产构建通过（Next.js 19 路由，`✓ Compiled successfully`）
