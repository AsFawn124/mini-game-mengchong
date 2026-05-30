# 🐾 萌宠大冒险 - 微信小程序版

基于 HTML5 Canvas 版适配的微信小程序萌宠收集养成游戏。

## 项目结构

```
wechat-miniprogram/
├── app.js / app.json / app.wxss    # 小程序入口
├── project.config.json             # 开发者工具配置
└── pages/game/
    ├── game.js    # 游戏主逻辑 (1756行)
    ├── game.wxml  # Canvas 页面
    ├── game.wxss  # 页面样式
    └── game.json  # 页面配置
```

## 功能清单

- 🏠 HUB 主城 - 金币/钻石/体力资源
- 🗺️ 冒险地图 - 关卡选择与解锁
- ⚔️ 回合制战斗 - 属性克制/技能系统
- 🎴 抽卡系统 - N/R/SR/SSR/UR 五档稀有度
- 📚 图鉴系统 - 萌宠收集浏览
- 🔧 合成系统 - 宠物合成进化
- 📋 任务系统 - 日常/主线任务
- ⚡ 进化系统 - 宠物进化石进化

## 适配说明

| 原版 | 小程序版 |
|-----|---------|
| 480x800 固定容器 | 等比缩放适配全屏 |
| `AudioContext` | `wx.createWebAudioContext()` |
| `localStorage` | `wx.getStorageSync/setStorageSync` |
| DOM 通知弹窗 | Canvas 绘制 |
| 鼠标事件 | 触控事件 |
| 滚轮滚动 | 手指滑动 |

## 导入方法

1. 微信开发者工具 → 导入项目
2. 目录选 `wechat-miniprogram/`
3. AppID 填 `wxfe2d6586f3b6169c`
4. 导入后预览
