# 萌宠大冒险 - 快速上手指南

## 🚀 5分钟运行游戏

### 1. 安装开发环境
```bash
# 下载并安装 Cocos Creator 3.8
# https://www.cocos.com/creator-download

# 下载并安装微信开发者工具
# https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
```

### 2. 打开项目
1. 打开 Cocos Creator
2. 点击 "打开其他项目"
3. 选择 `game-design-mengchong` 文件夹
4. 等待项目加载完成

### 3. 预览游戏
1. 点击顶部 "预览" 按钮
2. 或按 Ctrl/Cmd + P
3. 游戏将在浏览器中运行

### 4. 构建微信小游戏
1. 点击 "项目" → "构建发布"
2. 选择 "微信小游戏"
3. 点击 "构建"
4. 用微信开发者工具打开 `build/wechatgame` 文件夹

## 🎮 游戏操作

### 主界面
- **合成区域**: 拖拽相同萌宠进行合成
- **底部导航**: 首页/背包/抽卡/排行/设置
- **顶部资源**: 金币/钻石/体力显示

### 核心玩法
1. **购买萌宠**: 点击购买按钮获得新萌宠
2. **拖拽合成**: 将相同萌宠拖到一起来合成升级
3. **自动产金币**: 萌宠会自动产出金币
4. **抽卡**: 消耗钻石抽取新萌宠
5. **战斗**: 消耗体力挑战关卡

## 💰 变现功能

### 已实现
- 激励视频接口（预留）
- 内购系统框架
- 广告点位设计

### 需要配置
- 微信广告ID
- 微信支付商户号
- 云开发环境

## 🐛 常见问题

### Q: 项目打不开？
A: 确保安装 Cocos Creator 3.8 或更高版本

### Q: 如何添加自己的萌宠？
A: 修改 `PetManager.ts` 中的 `loadPetConfigs()` 方法

### Q: 如何修改游戏数值？
A: 修改 `GameConfig.ts` 中的配置项

### Q: 如何接入微信登录？
A: 参考微信官方文档，在 `GameMain.ts` 中添加登录代码

## 📚 学习资源

### Cocos Creator
- 官方文档: https://docs.cocos.com/
- 教程: https://www.bilibili.com/video/BV1sA411G7qM

### 微信小游戏
- 开发文档: https://developers.weixin.qq.com/minigame/dev/guide/
- 云开发: https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html

## 🎯 下一步

1. **UI设计**: 使用 Figma/PS 设计游戏界面
2. **美术资源**: 制作萌宠原画和UI素材
3. **音效音乐**: 添加背景音乐和音效
4. **微信接入**: 登录、分享、支付、广告
5. **测试优化**: 性能优化和bug修复
6. **上线发布**: 提交微信审核

## 📞 需要帮助？

- 查看 `README.md` 完整设计方案
- 查看 `TODO.md` 开发任务清单
- 在GitHub提交Issue

---

**祝你开发顺利！打造爆款游戏！** 🎉