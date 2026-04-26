# 萌宠大冒险 - 快速开始指南

## 🚨 当前问题：缺少构建文件

**错误**: `game.json: file not found`

**原因**: 项目源码需要编译后才能运行

---

## ✅ 解决方案

### 方案1：使用 Cocos Creator 构建（推荐）

#### 步骤1：安装 Cocos Creator
1. 下载 [Cocos Creator 3.8.0](https://www.cocos.com/creator-download)
2. 安装并启动

#### 步骤2：打开项目
1. Cocos Creator -> 打开项目
2. 选择 `game-design-mengchong` 文件夹

#### 步骤3：构建项目
1. 菜单栏：项目 -> 构建发布
2. 发布平台：微信小游戏
3. 构建路径：`build/wechatgame`
4. 点击 "构建"

#### 步骤4：导入微信开发者工具
1. 打开微信开发者工具
2. 导入项目
3. 选择 `build/wechatgame` 目录
4. AppID: `wx8e1435739bbdf94d`

---

### 方案2：仅查看代码（不运行）

如果你只想查看代码而不运行：

1. 用 **VS Code** 或 **WebStorm** 打开项目
2. 代码在 `assets/scripts/` 目录
3. 美术资源在 `assets/` 目录

---

## 📁 项目结构

### 源码目录（开发）
```
game-design-mengchong/
├── assets/              # 游戏资源
│   ├── scripts/        # TypeScript 代码
│   │   ├── managers/   # 管理器
│   │   ├── components/ # UI组件
│   │   └── config/     # 配置
│   ├── pets/           # 萌宠图片（40张）
│   ├── backgrounds/    # 背景图片（7张）
│   ├── ui/             # UI元素
│   ├── icons/          # 图标
│   └── effects/        # 特效
├── docs/               # 文档
└── build/              # 构建输出（需要生成）
    └── wechatgame/     # 微信小游戏
```

### 运行目录（构建后）
```
build/wechatgame/
├── game.js             # 入口文件
├── game.json           # 游戏配置
├── project.config.json # 项目配置
├── src/                # 编译后的JS
└── assets/             # 资源文件
```

---

## 🔧 技术栈

- **引擎**: Cocos Creator 3.8.0
- **语言**: TypeScript
- **平台**: 微信小游戏
- **后端**: 微信云开发

---

## 📦 已完成内容

- ✅ 游戏核心代码（TypeScript）
- ✅ 美术资源（64个文件）
- ✅ 微信配置（AppID: wx8e1435739bbdf94d）
- ✅ 云开发配置指南
- ❌ 编译后的运行文件（需要构建）

---

## ❓ 常见问题

### Q: 为什么直接导入报错？
A: 这是源码项目，需要先用 Cocos Creator 编译生成运行文件

### Q: 可以跳过构建直接运行吗？
A: 不可以，TypeScript 需要编译成 JavaScript 才能运行

### Q: 构建需要多久？
A: 首次构建约 2-5 分钟，后续增量构建很快

---

## 📞 需要帮助？

1. 查看 `CLOUD_SETUP.md` - 云开发配置
2. 查看 `RELEASE_CHECKLIST.md` - 发布清单
3. 查看 `WECHAT_IMPORT_GUIDE.md` - 导入指南

---

**项目状态**: 源码已完成，等待构建
**AppID**: wx8e1435739bbdf94d
