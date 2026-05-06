# 🎮 萌宠大冒险 - 微信小游戏

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/AsFawn124/mini-game-mengchong)
[![Platform](https://img.shields.io/badge/platform-微信小游戏-green.svg)](https://developers.weixin.qq.com/minigame/dev/guide/)
[![Engine](https://img.shields.io/badge/engine-Cocos%20Creator%203.x-orange.svg)](https://www.cocos.com/)

## 📖 项目简介

《萌宠大冒险》是一款萌系治愈风格的微信小游戏，融合了萌宠收集、Roguelike战斗和社交竞技元素。

### 核心玩法
- 🐱 **萌宠收集**：50+只萌宠等你收集（N/R/SR/SSR）
- ⚔️ **Roguelike战斗**：自动战斗 + 技能Build
- 🎲 **抽卡系统**：单抽/十连抽，保底机制
- 🔥 **属性克制**：火/水/草/光/暗相生相克
- 👥 **社交竞技**：好友排行榜、组队挑战

## 🚀 快速开始

### 环境要求
- Node.js 16+
- Cocos Creator 3.x
- 微信开发者工具

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/AsFawn124/mini-game-mengchong.git

# 2. 进入项目目录
cd mini-game-mengchong

# 3. 安装依赖
npm install

# 4. 用Cocos Creator打开项目
# 选择 "项目" -> "构建发布" -> "微信小游戏"

# 5. 用微信开发者工具导入build目录
```

### 配置

修改 `src/GameConfig.ts`：
```typescript
WECHAT: {
    APP_ID: '你的小程序AppID',
    ENV_ID: '你的云开发环境ID'
}
```

## 📁 项目结构

```
mini-game-mengchong/
├── src/                      # 源代码
│   ├── GameConfig.ts         # 游戏配置
│   ├── GameMain.ts           # 游戏主入口
│   ├── managers/             # 管理器
│   │   ├── PetManager.ts     # 萌宠管理
│   │   ├── BattleManager.ts  # 战斗系统
│   │   ├── AudioManager.ts   # 音频管理
│   │   ├── WechatSDK.ts      # 微信SDK
│   │   └── CloudManager.ts   # 云开发
│   ├── ui/                   # UI界面
│   │   ├── MainSceneUI.ts    # 主场景
│   │   ├── BattleSceneUI.ts  # 战斗场景
│   │   ├── GachaSceneUI.ts   # 抽卡场景
│   │   └── BagSceneUI.ts     # 背包场景
│   ├── entities/             # 实体
│   │   └── PetEntity.ts      # 萌宠实体
│   └── utils/                # 工具类
│       └── GameUtils.ts      # 游戏工具
├── assets/                   # 资源文件
│   └── resources/            # 游戏资源
├── server/                   # 服务端
│   └── cloudfunctions/       # 云函数
├── docs/                     # 文档
│   ├── AI_Asset_Generation.md
│   ├── Testing_Guide.md
│   └── Deployment_Guide.md
└── build/                    # 构建输出
```

## 🎨 游戏特色

### 萌宠系统
| 稀有度 | 数量 | 获取方式 | 特点 |
|:---:|:---:|:---:|:---:|
| N | 20 | 关卡掉落 | 基础萌宠 |
| R | 15 | 抽卡/活动 | 特色技能 |
| SR | 10 | 抽卡/合成 | 强力组合 |
| SSR | 5 | 限定活动 | 改变战局 |

### 战斗系统
- ✅ 自动战斗，策略为王
- ✅ 每3波选择一次技能
- ✅ 属性克制，伤害翻倍
- ✅ 无尽模式，挑战极限

### 社交功能
- ✅ 好友排行榜
- ✅ 组队挑战
- ✅ 萌宠交换
- ✅ 分享复活

## 💰 变现设计

| 模式 | 占比 | 说明 |
|:---:|:---:|:---:|
| 激励视频 | 40% | 复活、双倍奖励 |
| 内购 | 35% | 抽卡、皮肤、月卡 |
| Banner广告 | 15% | 底部横幅 |
| 插屏广告 | 10% | 关卡间插入 |

## 🛠️ 技术栈

- **引擎**: Cocos Creator 3.x
- **语言**: TypeScript
- **平台**: 微信小游戏
- **后端**: 微信云开发
- **数据库**: MongoDB (云开发)
- **存储**: 云存储

## 📱 屏幕适配

- 设计分辨率: 750x1334 (竖屏)
- 适配方案: 固定高度，宽度自适应
- 安全区域: 自动适配刘海屏、全面屏

## 🧪 测试

```bash
# 运行测试
npm test

# 查看测试报告
npm run test:coverage
```

测试文档详见 [Testing_Guide.md](docs/Testing_Guide.md)

## 🚀 部署

详见 [Deployment_Guide.md](docs/Deployment_Guide.md)

快速部署步骤：
1. 配置AppID和环境ID
2. 部署云函数
3. 构建项目
4. 上传微信审核
5. 发布上线

## 📊 项目进度

| 模块 | 进度 | 状态 |
|:---:|:---:|:---:|
| 核心框架 | 100% | ✅ |
| 萌宠系统 | 100% | ✅ |
| 战斗系统 | 100% | ✅ |
| UI界面 | 100% | ✅ |
| 微信SDK | 100% | ✅ |
| 云开发 | 100% | ✅ |
| 美术资源 | 待制作 | ⏳ |
| 音效音乐 | 待制作 | ⏳ |

**总体进度: 100% (代码完成)**

## 📝 文档

- [游戏设计文档](README.md)
- [AI美术生成指南](docs/AI_Asset_Generation.md)
- [测试指南](docs/Testing_Guide.md)
- [部署指南](docs/Deployment_Guide.md)
- [更新日志](COMMIT_LOG.md)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可

MIT License

## 👤 作者

- GitHub: [@AsFawn124](https://github.com/AsFawn124)
- 项目地址: https://github.com/AsFawn124/mini-game-mengchong

---

⭐ 如果这个项目对你有帮助，请给个Star！
