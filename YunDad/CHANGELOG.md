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

## 2026-11-13（晚）· 第二轮冲刺

### 新增
- **体重记录**：WeightRecord 表（同日 upsert）+ `/api/weights`（GET/POST/PATCH/DELETE + profile PUT，孕周自动计算，孕前 BMI 基准）+ App 体重卡片（7日趋势/IOM 增重建议）
- **真实推送**：PushToken 表 + `/api/push/register`（注册/软注销）+ lib/push.ts（Expo Push 单发/批量/按用户广播，时间窗 08-21 点）
- **AI 问答/产检单解读**：lib/ai.ts（GLM glm-4-flash 免费档适配，mock/glm 双模式）+ `/api/ai/chat`（限流 10 次/时）+ `/api/ai/report`（结构化解读，限流 5 次/时，医疗合规 prompt）
- **准爸妈绑定**：`/api/partner/bind`（8 位邀请码，10 分钟有效，防自绑/复用/过期）

### 决策
- 体重曲线 MVP 用数值条形图，不引 SVG 库（省体积省工期）
- 推送只做提醒类（产检/打卡/记录），禁营销；厂商通道二期再评估
- AI 默认 mock 模式零成本；真实调用需主人批准 AI_API_KEY
- 绑定方案选邀请码（最简），妈妈端小程序入口二期（微信审核另行）

### 自测
- 体重：upsert 同日覆盖/孕周计算（→14周）/排序/401/越权 404 全过
- AI：mock 问答+解读/模式查询/401/400/限流 429 全过
- 绑定：生成/404/自绑 400/绑定成功/复用 409/双向状态/401 全过

## 2026-11-14（凌晨）· App端补齐

### 新增
- **AI助手页**：气泡聊天+快捷问题+配额显示+产检单解读入口（AiScreen + ai-store）
- **家庭绑定页**：生成邀请码/输入绑定/已绑定三视图（PartnerScreen）
- 双Tab注册（AI助手/家庭），全量tsc 0错误，commit 61cd8bb已推送

### 里程碑
- 后端API + App UI 全链路就绪，距可试用MVP仅剩真机联调
