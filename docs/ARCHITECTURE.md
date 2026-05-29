# 🏗️ 萌宠大作战 — 架构设计

---

## 游戏状态机流程

```
         ┌────────────┐
         │  APP启动    │
         └─────┬──────┘
               ▼
         ┌────────────┐
         │  Splash    │
         └─────┬──────┘
               ▼
         ┌────────────┐
         │  登录/初始化 │
         └─────┬──────┘
               ▼
     ┌─────────────────┐
     │    MainMenu      │◄──────────────────────────┐
     │  (萌宠花园大厅)   │                           │
     └──┬──┬──┬──┬──┬──┘                           │
        │  │  │  │  │                              │
   ┌────┘  │  │  │  └────┐                         │
   ▼       ▼  ▼  ▼       ▼                         │
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ 战斗  │ │ 抽卡 │ │ 背包 │ │ 商店 │              │
│Battle│ │Gacha │ │ Bag │ │ Shop │              │
└──┬───┘ └──────┘ └──┬───┘ └──────┘              │
   │                  │                            │
   ▼                  ▼                            │
┌──────┐      ┌──────────────┐                    │
│ 结算  │      │  养成/强化    │                    │
│Result│      │ 进化/融合/装备 │                    │
└──┬───┘      └──────────────┘                    │
   │                                               │
   └───────────────────────────────────────────────┘

     其他入口:
     ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
     │ PvP  │  │ 公会 │  │ 探索 │  │ 活动 │
     │Arena │  │Guild │  │World │  │Event │
     └──────┘  └──────┘  └──────┘  └──────┘
```

## 数据流架构

```
┌─────────────────────────────────────┐
│           GameConfig (全局)           │
│  saveLocal() / loadLocal() 统一接口   │
└───────────────┬─────────────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐
│本地存储 │ │云存档   │ │内存缓存 │
│localSt │ │CloudDB │ │  Map   │
└────────┘ └────────┘ └────────┘
                │
    ┌───────────┴───────────────┐
    ▼                           ▼
┌──────────┐              ┌──────────┐
│ 玩家数据  │              │ 服务端数据 │
│ • 萌宠   │              │ • 排行榜  │
│ • 货币   │              │ • 好友    │
│ • 装备   │              │ • 公会    │
│ • 进度   │              │ • 活动    │
└────┬─────┘              └─────┬────┘
     │                          │
     └──────────┬───────────────┘
                ▼
         ┌─────────────┐
         │  EventBus   │  事件通知所有订阅者
         └──────┬──────┘
                │
    ┌───────────┼────────────┐
    ▼           ▼            ▼
┌──────┐  ┌────────┐  ┌──────────┐
│UI刷新 │  │成就检查│  │ 数据持久化│
└──────┘  └────────┘  └──────────┘
```

## 模块依赖

```
GameMain (入口)
├── GameConfig (配置/存储)
├── EventBus (事件总线)
├── StateMachine (状态管理)
│   ├── SplashState
│   ├── MainMenuState
│   ├── BattleState → AutoBattleManager
│   ├── GachaState
│   ├── BagState → PetBreedingSystem
│   ├── ShopState → MarketCompetitionSystem
│   ├── ArenaState → PvpManager
│   ├── GuildState → GuildManager
│   ├── WorldState → WorldMapManager
│   └── EventState → EventManager
├── 商业系统
│   └── MarketCompetitionSystem
├── 社交系统
│   ├── PvpManager
│   ├── GuildManager
│   └── Social sharing
├── 养成系统
│   ├── PetManager (萌宠管理)
│   ├── PetBreedingSystem (繁衍融合)
│   └── Equipment (装备系统)
├── 内容系统
│   ├── EventManager (限时活动)
│   ├── AchievementManager (成就)
│   ├── DailyTaskManager (日常)
│   ├── BattlePass (通行证)
│   └── TutorialManager (引导)
├── 工具
│   ├── LocalizationManager (多语言)
│   ├── AudioManager (音效)
│   └── GameUtils (通用工具)
└── 平台
    ├── WechatSDK (微信)
    └── CloudManager (云开发)
```

## 文件清单

```
src/
├── GameMain.ts              启动入口
├── GameConfig.ts             全局配置/存储接口
├── entities/
│   └── PetEntity.ts          萌宠数据实体
├── managers/
│   ├── AutoBattleManager.ts  自动战斗
│   ├── BattleManager.ts      战斗管理
│   ├── PetManager.ts         萌宠管理
│   ├── PetBreedingSystem.ts  繁衍融合
│   ├── UIManager.ts          UI管理
│   ├── PvpManager.ts         PvP竞技
│   ├── GuildManager.ts       公会系统
│   ├── EventManager.ts       限时活动
│   ├── WorldMapManager.ts    世界探索
│   ├── MarketCompetitionSystem.ts  变现
│   ├── LocalizationManager.ts      多语言
│   ├── AchievementManager.ts       成就
│   ├── DailyTaskManager.ts         日常
│   ├── TutorialManager.ts          引导
│   ├── AudioManager.ts             音效
│   ├── CloudManager.ts             云开发
│   ├── FriendManager.ts            好友
│   ├── PerformanceOptimizer.ts     性能优化
│   └── WechatSDK.ts                微信SDK
├── ui/
│   ├── MainSceneUI.ts
│   ├── BattleSceneUI.ts
│   ├── GachaSceneUI.ts
│   ├── BagSceneUI.ts
│   ├── ShopSceneUI.ts
│   ├── RankSceneUI.ts
│   └── FriendSceneUI.ts
├── config/
│   └── AudioConfig.ts
└── utils/
    └── GameUtils.ts
```

## 完整游戏循环

```
每日: 签到 → 日常任务 → 免费抽卡 → PvP x3 → 世界探索 → 公会捐献
每周: 公会战 → 竞技场结算 → 周常任务 → 限时活动刷新
每月: 赛季结算 → 通行证重置 → 新活动开启 → 新萌宠UP

长期:
├── 主线关卡推进 (5章25关)
├── 萌宠收集 (50只目标)
├── PvP段位爬升 (8段位)
├── 世界探索度 (6区域100%)
└── 社交积累 (好友/公会/邀请)
```

---

*文档版本: v1.0 | 2026-05-29*
