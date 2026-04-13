# GitHub 提交说明

## 项目信息
- **项目名称**: 萌宠大冒险 (Pet Merge Adventure)
- **GitHub用户名**: AsFawn124
- **项目类型**: 微信小游戏
- **开发引擎**: Cocos Creator 3.x

## 提交历史

### Commit 1: Initial commit
- 项目框架搭建
- 核心系统开发
- 完整游戏设计方案

## 项目结构
```
mini-game-mengchong/
├── README.md                    # 完整设计方案
├── README-game.md               # 游戏项目说明
├── README-final.md              # 简洁版README
├── TODO.md                      # 开发任务清单
├── package.json                 # 项目配置
├── project.json                 # Cocos项目配置
└── assets/
    ├── scenes/
    │   └── MainScene.scene      # 主场景
    └── scripts/
        ├── config/
        │   └── GameConfig.ts    # 游戏配置
        ├── managers/
        │   ├── PetManager.ts    # 萌宠管理器
        │   ├── BattleManager.ts # 战斗管理器
        │   ├── EffectManager.ts # 特效管理器
        │   └── AudioManager.ts  # 音频管理器
        ├── components/
        │   ├── PetEntity.ts     # 萌宠实体
        │   ├── MergeSystem.ts   # 合成系统
        │   ├── MainSceneUI.ts   # 主场景UI
        │   ├── GachaSceneUI.ts  # 抽卡场景UI
        │   └── BagSceneUI.ts    # 背包场景UI
        ├── utils/
        │   └── Utils.ts         # 工具类
        └── GameMain.ts          # 游戏入口
```

## 核心功能

### 已实现
- ✅ 游戏配置系统
- ✅ 萌宠管理器（抽卡、升级）
- ✅ 战斗管理器（自动战斗、Roguelike）
- ✅ 合成系统（拖拽合成）
- ✅ 特效管理器
- ✅ 音频管理器
- ✅ UI界面框架
- ✅ 工具类

### 待实现
- 🔄 UI美术资源
- 🔄 音效音乐
- 🔄 微信SDK接入
- 🔄 云开发配置

## 技术栈
- Cocos Creator 3.x
- TypeScript
- 微信云开发

## 如何运行
1. 安装 Cocos Creator 3.8+
2. 打开项目文件夹
3. 点击预览运行

## 联系方式
- GitHub: @AsFawn124

---
**项目进度: 15% | 预计完成: 2025年7月**