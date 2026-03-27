# 孕爸爸 App - YunDad1.0

## 📱 版本信息

| 项目 | 内容 |
|------|------|
| 版本号 | YunDad1.0 |
| 发布日期 | 2025-02-27 |
| 技术栈 | React Native (Expo) |
| 平台支持 | iOS / Android |

---

## 🎯 功能概览

### 五大核心模块

| Tab | 功能 |
|-----|------|
| 🏠 首页 | 宝宝信息卡片、今日饮食计划(6餐打卡)、每日小贴士、推荐食谱 |
| 🍽️ 食谱 | 分类筛选、搜索、收藏、详情弹窗(食材/做法/营养) |
| ✅ 打卡 | 等级系统(Lv.1-6)、月度统计、日历视图、打卡记录 |
| 🎒 待产包 | 准备进度、分类清单、自定义添加/删除 |
| 👤 我的 | 用户信息、深色模式、设置、关于 |

### 用户等级系统

```
Lv.1 孕期小白   (0-50 积分)
Lv.2 孕期新手   (50-150 积分)
Lv.3 孕期达人   (150-300 积分)
Lv.4 孕期专家   (300-500 积分)
Lv.5 孕期大师   (500-800 积分)
Lv.6 超级准妈   (800+ 积分)
```

---

## 🛠️ 技术栈

- **框架**: React Native + Expo SDK 55
- **语言**: TypeScript 5
- **导航**: React Navigation 6
- **状态管理**: Zustand 5
- **UI组件**: 自定义组件 + Ionicons图标

---

## 📂 项目结构

```
YunDad1.0/
├── App.tsx                    # 主入口
├── app.json                   # Expo配置
├── package.json               # 依赖配置
├── src/
│   ├── screens/               # 页面组件
│   │   ├── HomeScreen.tsx     # 首页
│   │   ├── RecipeScreen.tsx   # 食谱
│   │   ├── CheckInScreen.tsx  # 打卡
│   │   ├── BabyBagScreen.tsx  # 待产包
│   │   ├── ProfileScreen.tsx  # 我的
│   │   └── Onboarding.tsx     # 引导流程
│   ├── components/
│   │   └── common.tsx         # 公共组件
│   ├── store/
│   │   └── index.ts           # Zustand状态管理
│   ├── constants/
│   │   ├── index.ts           # 常量配置
│   │   └── recipes.ts         # 食谱数据
│   ├── utils/
│   │   └── index.ts           # 工具函数
│   └── types/
│       └── index.ts           # TypeScript类型
└── assets/                    # 资源文件
```

---

## 🚀 运行方式

### 前提条件
- Node.js 18+
- npm 或 bun
- Expo CLI

### 启动开发服务器

```bash
cd YunDad1.0

# 安装依赖
npm install

# 启动开发服务器 (Tunnel模式)
npx expo start --tunnel
```

### 手机预览

1. **安装 Expo Go App**
   - iOS: App Store 搜索 "Expo Go"
   - Android: Google Play 下载

2. **连接方式**
   - 方式一: Safari 输入 Tunnel URL
   - 方式二: Expo Go 扫描二维码

### 构建发布版本

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 构建 iOS
eas build --platform ios

# 构建 Android
eas build --platform android
```

---

## 📝 开发说明

### 积分规则
- 每次打卡: +10积分
- 每日全部完成: +20额外积分
- 连续打卡7天: +50积分
- 收藏食谱: +2积分

### 孕期宝宝大小参考
- 4周: 芝麻种子
- 8周: 覆盆子
- 12周: 青柠
- 16周: 牛油果
- 20周: 香蕉
- 24周: 玉米棒
- 28周: 菜花
- 32周: 西葫芦
- 36周: 罗马生菜
- 40周: 西瓜

---

## 📋 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| YunDad1.0 | 2025-02-27 | React Native原生版本首次发布 |

---

## 👨‍💻 作者

Z.ai Code - AI编程助手

---

© 2025 孕爸爸 All Rights Reserved
