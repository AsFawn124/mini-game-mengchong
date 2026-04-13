# 萌宠大冒险 - 微信小游戏

> 一款萌系治愈风格的合成+Roguelike微信小游戏

## 🎮 游戏特色

- 🐱 **萌系治愈**：50+可爱萌宠，温暖治愈画风
- ⚔️ **Roguelike玩法**：随机技能Build，每次不同体验
- 🔄 **合成系统**：拖拽合成，升级进化
- 🏆 **社交竞技**：好友排行榜、组队挑战
- 💰 **多元变现**：激励视频、内购、广告

## 🚀 快速开始

### 环境要求
- Cocos Creator 3.8+
- Node.js 16+
- 微信开发者工具

### 安装
```bash
npm install
```

### 开发
```bash
npm run preview    # 预览模式
npm run dev        # 微信小游戏开发
```

### 构建
```bash
npm run build      # 构建微信小游戏
```

## 📁 项目结构

```
mini-game-mengchong/
├── assets/
│   ├── scripts/
│   │   ├── config/          # 配置文件
│   │   │   └── GameConfig.ts
│   │   ├── managers/        # 管理器
│   │   │   ├── PetManager.ts
│   │   │   ├── BattleManager.ts
│   │   │   ├── EffectManager.ts
│   │   │   └── AudioManager.ts
│   │   ├── components/      # 组件
│   │   │   ├── PetEntity.ts
│   │   │   ├── MergeSystem.ts
│   │   │   ├── MainSceneUI.ts
│   │   │   ├── GachaSceneUI.ts
│   │   │   └── BagSceneUI.ts
│   │   ├── utils/           # 工具
│   │   │   └── Utils.ts
│   │   └── GameMain.ts      # 游戏入口
│   ├── scenes/              # 场景文件
│   ├── prefabs/             # 预制体
│   ├── textures/            # 图片资源
│   ├── animations/          # 动画资源
│   └── audios/              # 音效资源
├── build/                   # 构建输出
├── docs/                    # 文档
└── README.md
```

## 🎯 核心玩法

### 1. 合成系统
- 拖拽相同萌宠进行合成
- 合成后升级进化
- 解锁更强大的萌宠

### 2. 战斗系统
- 选择3只萌宠出战
- 自动战斗+技能选择
- 挑战无尽关卡

### 3. 抽卡系统
- 单抽/十连抽
- N/R/SR/SSR稀有度
- 保底机制

### 4. 养成系统
- 萌宠升级
- 技能强化
- 装备系统

## 💰 变现设计

| 模式 | 说明 | 占比 |
|:---|:---|:---:|
| 激励视频 | 复活、双倍奖励、额外抽卡 | 40% |
| 内购 | 钻石、月卡、战令、皮肤 | 35% |
| Banner广告 | 底部横幅 | 15% |
| 插屏广告 | 关卡间插入 | 10% |

## 📊 预期数据

| 指标 | 目标 |
|:---|:---:|
| 次日留存 | 45% |
| 7日留存 | 25% |
| ARPU | ¥0.5 |
| 月活跃用户 | 10万 |

## 🛠️ 技术栈

- **引擎**: Cocos Creator 3.x
- **语言**: TypeScript
- **后端**: 微信云开发
- **数据库**: MongoDB

## 📅 开发计划

- [x] 游戏设计方案
- [x] 项目框架搭建
- [x] 核心系统开发
- [ ] UI界面设计
- [ ] 美术资源制作
- [ ] 音效音乐制作
- [ ] 测试优化
- [ ] 上线发布

## 👥 团队

- 策划: [Your Name]
- 程序: [Your Name]
- 美术: [To be hired]
- 音效: [To be hired]

## 📄 许可证

MIT License

---

**欢迎Star和Fork！一起打造爆款微信小游戏！** ⭐