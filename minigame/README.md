# 萌宠大冒险 - 微信小游戏运行目录

## ⚠️ 重要说明

这个目录是微信小游戏的运行目录，但**目前缺少构建后的文件**。

## 🚀 正确的使用方式

### 方式1：使用 Cocos Creator 构建（推荐）

1. 打开 Cocos Creator 3.8.0
2. 打开本项目
3. 菜单：项目 -> 构建发布
4. 选择平台：微信小游戏
5. 构建路径：`build/wechatgame` 或 `minigame`
6. 点击 "构建"
7. 用微信开发者工具导入构建后的目录

### 方式2：开发调试

如果只是查看代码结构，可以：

1. 用微信开发者工具导入项目根目录
2. 在 "详情" 中勾选 "不校验合法域名"
3. 这会显示项目结构，但无法运行游戏

## 📁 目录结构

构建完成后，目录应该包含：

```
minigame/
├── game.js           # 游戏入口
├── game.json         # 游戏配置
├── project.config.json # 项目配置
├── src/              # 编译后的代码
│   ├── application.js
│   ├── engine.js
│   ├── plugin-require.js
│   └── settings.js
├── assets/           # 资源文件
│   ├── main/
│   └── resources/
└── subpackages/      # 分包（如果有）
```

## 🔧 当前状态

- ✅ 配置文件已创建
- ❌ 缺少构建后的游戏代码
- ❌ 缺少资源文件

**需要先使用 Cocos Creator 构建项目！**

## 📞 帮助

- [Cocos Creator 文档](https://docs.cocos.com/creator/manual/zh/)
- [微信小游戏文档](https://developers.weixin.qq.com/minigame/dev/guide/)
