# 《萌宠大冒险》Cocos Creator 导入指南

## 项目概述

- **引擎版本**: Cocos Creator 3.x
- **项目类型**: 微信小游戏
- **开发语言**: TypeScript
- **屏幕适配**: 720x1280 (竖屏)

---

## 导入步骤

### 1. 环境准备

确保已安装:
- Cocos Creator 3.6+ (推荐最新稳定版)
- 微信开发者工具
- Node.js (用于云函数开发)

### 2. 打开项目

1. 启动 Cocos Creator
2. 点击 "打开项目"
3. 选择 `game-design-mengchong` 文件夹
4. 等待项目导入完成

### 3. 项目结构验证

导入后检查以下目录结构:

```
assets/
├── scenes/          # 7个场景文件
│   ├── MainScene.scene
│   ├── BattleScene.scene
│   ├── GachaScene.scene
│   ├── BagScene.scene
│   ├── ShopScene.scene
│   ├── RankScene.scene
│   └── SettingScene.scene
├── scripts/
│   ├── components/  # UI组件脚本
│   ├── managers/    # 管理器脚本 (14个)
│   └── config/      # 配置文件
├── resources/       # 资源配置
│   ├── pets_config.json
│   └── audio_config.json
├── pets/           # 萌宠图片资源
└── ...
```

### 4. 场景检查

在资源管理器中确认所有场景文件图标正常显示:
- ✅ MainScene - 主界面
- ✅ BattleScene - 战斗
- ✅ GachaScene - 抽卡
- ✅ BagScene - 背包
- ✅ ShopScene - 商店
- ✅ RankScene - 排行榜
- ✅ SettingScene - 设置

### 5. 脚本检查

确认所有TypeScript文件无报错:
1. 打开 `assets/scripts/components/MainSceneUI.ts`
2. 检查是否有红色报错提示
3. 如有报错，检查编辑器版本兼容性

### 6. 预览测试

1. 点击顶部工具栏的预览按钮
2. 选择浏览器预览
3. 检查主场景是否正常显示

---

## 构建发布

### 微信小游戏构建

1. 菜单: **项目 -> 构建发布**
2. 构建选项:
   - **发布平台**: 微信小游戏
   - **AppID**: wx8e1435739bbdf94d
   - **构建路径**: build/wechatgame
   - **初始场景**: MainScene
3. 点击 **构建**

### 微信开发者工具导入

1. 打开微信开发者工具
2. 选择 **导入项目**
3. 选择 `build/wechatgame` 目录
4. 输入 AppID: wx8e1435739bbdf94d
5. 点击 **导入**

---

## 常见问题

### Q1: 场景文件打开报错
**解决**: 确保使用 Cocos Creator 3.x 版本，2.x版本不兼容

### Q2: TypeScript编译错误
**解决**: 
1. 检查 `tsconfig.json` 配置
2. 重启 Cocos Creator
3. 删除 `library` 和 `temp` 文件夹后重新导入

### Q3: 图片资源丢失
**解决**: 
- 项目使用程序色块作为占位
- 正式美术资源需要后续添加

### Q4: 音频无法播放
**解决**:
- 音频配置文件已就绪
- 需要添加实际音频文件到 `assets/audio/`

---

## 资源补充指南

### 添加萌宠图片
1. 将图片放入 `assets/pets/`
2. 命名格式: `pet_XXX_name.png`
3. 在 `pets_config.json` 中添加配置

### 添加音频文件
1. 将音频放入 `assets/audio/`
2. 命名与 `audio_config.json` 中一致
3. 支持的格式: mp3, wav

### 添加UI素材
1. 将图片放入 `assets/ui/`
2. 在场景中选择对应节点
3. 在 Sprite 组件中设置图片

---

## 开发调试

### 本地调试
- 使用浏览器预览进行快速调试
- 使用 Chrome DevTools 调试 TypeScript

### 真机调试
1. 构建微信小游戏
2. 在微信开发者工具中预览
3. 使用真机扫码测试

---

## 项目配置

### 游戏配置
编辑 `assets/scripts/config/GameConfig.ts`:
```typescript
export const GameConfig = {
    GAME_NAME: "萌宠大冒险",
    VERSION: "1.0.0",
    // ...
};
```

### 微信配置
编辑 `game.json`:
```json
{
    "deviceOrientation": "portrait",
    "showStatusBar": false,
    "cloud": true
}
```

---

## 技术支持

- **项目文档**: 查看 `docs/` 目录
- **API文档**: https://docs.cocos.com/
- **微信小游戏文档**: https://developers.weixin.qq.com/minigame/dev/guide/

---

## 完成检查清单

- [ ] Cocos Creator 成功导入项目
- [ ] 所有场景文件正常显示
- [ ] 所有脚本无编译错误
- [ ] 浏览器预览正常运行
- [ ] 微信小游戏构建成功
- [ ] 微信开发者工具导入成功

**项目已准备就绪，可以开始开发或构建发布！** 🎮
