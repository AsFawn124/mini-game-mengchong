# 🎵 萌宠大冒险 - 音效挑选指南

> 所有音效已生成完毕！你可以试听并选择最喜欢的版本

---

## 📂 音效文件结构

```
assets/audio/
├── bgm_main.mp3           # 主界面BGM
├── bgm_battle.mp3         # 战斗BGM
├── bgm_gacha.mp3          # 抽卡BGM
├── bgm_victory.mp3        # 胜利BGM
├── bgm_defeat.mp3         # 失败BGM
├── sfx_click.mp3          # 点击音效（默认）
├── sfx_popup.mp3          # 弹窗音效
├── sfx_close.mp3          # 关闭音效
├── sfx_merge.mp3          # 合成音效
├── sfx_levelup.mp3        # 升级音效
├── sfx_gacha.mp3          # 抽卡音效
├── sfx_gacha_rare.mp3     # 稀有抽中
├── sfx_gacha_ssr.mp3      # SSR抽中
├── sfx_attack.mp3         # 攻击音效
├── sfx_skill_fire.mp3     # 火技能
├── sfx_skill_ice.mp3      # 冰技能
├── sfx_skill_thunder.mp3  # 雷技能
├── sfx_hit.mp3            # 受击音效
├── sfx_victory.mp3        # 胜利音效
├── sfx_defeat.mp3         # 失败音效
├── AUDIO_README.md        # 音效说明文档
├── SFX_PREVIEW.md         # 音效预览文档
├── SFX_SELECTION_GUIDE.md # 本文件
└── alternatives/          # 备选音效变体
    ├── click_variant1.mp3   # 点击变体1（高频短促）
    ├── click_variant2.mp3   # 点击变体2（中频）
    ├── click_variant3.mp3   # 点击变体3（标准）
    ├── success_variant1.mp3 # 成功变体1
    ├── success_variant2.mp3 # 成功变体2
    ├── coin_variant1.mp3    # 金币变体1（清脆）
    └── coin_variant2.mp3    # 金币变体2
```

---

## 🎧 音效试听建议

### 1. 使用VS Code试听
在VS Code中安装 **"Audio Preview"** 插件，可以直接点击MP3文件播放

### 2. 使用系统播放器
```bash
# macOS
open assets/audio/sfx_click.mp3

# Linux
vlc assets/audio/sfx_click.mp3
# 或
ffplay assets/audio/sfx_click.mp3
```

### 3. 使用浏览器
将MP3文件拖到浏览器中即可播放

---

## 🔄 如何替换音效

### 方法一：直接替换文件
```bash
# 例如：用备选音效替换默认点击音效
cp assets/audio/alternatives/click_variant1.mp3 assets/audio/sfx_click.mp3
```

### 方法二：修改配置（推荐）
在 `src/config/AudioConfig.ts` 中修改音效路径：
```typescript
export const AudioPaths = {
    SFX: {
        [SFXType.CLICK]: 'audio/alternatives/click_variant1',  // 修改这里
        // ...
    }
};
```

---

## 📝 音效使用对照表

| 游戏场景 | 使用的音效文件 | 备注 |
|:---|:---|:---|
| **主界面** | bgm_main.mp3 | 循环播放 |
| **按钮点击** | sfx_click.mp3 | 所有按钮通用 |
| **弹窗打开** | sfx_popup.mp3 | 弹窗动画时 |
| **弹窗关闭** | sfx_close.mp3 | 关闭时 |
| **萌宠合成** | sfx_merge.mp3 | 合成成功时 |
| **萌宠升级** | sfx_levelup.mp3 | 升级时 |
| **抽卡转动** | sfx_gacha.mp3 | 抽卡动画 |
| **抽中稀有** | sfx_gacha_rare.mp3 | SR时播放 |
| **抽中SSR** | sfx_gacha_ssr.mp3 | SSR时播放 |
| **战斗开始** | bgm_battle.mp3 | 切换到战斗场景 |
| **普通攻击** | sfx_attack.mp3 | 攻击时 |
| **火技能** | sfx_skill_fire.mp3 | 火属性技能 |
| **冰技能** | sfx_skill_ice.mp3 | 水/冰属性技能 |
| **雷技能** | sfx_skill_thunder.mp3 | 雷属性技能 |
| **受击** | sfx_hit.mp3 | 被攻击时 |
| **战斗胜利** | bgm_victory.mp3 + sfx_victory.mp3 | BGM+音效 |
| **战斗失败** | bgm_defeat.mp3 + sfx_defeat.mp3 | BGM+音效 |

---

## 🎨 音效风格建议

### 萌系治愈风格（当前）
- 使用柔和的合成音效
- BGM使用轻快的旋律
- 适合目标用户群体（18-35岁女性）

### 如果要调整风格

**更休闲可爱**：
- 使用更高频的点击音效（click_variant1）
- 使用更清脆的金币音效（coin_variant1）

**更刺激爽快**：
- 战斗音效可以增加低频
- 胜利音效可以更长更华丽

**更复古像素**：
- 使用方波合成音效
- 8-bit风格BGM

---

## 🔧 音效音量建议

在 `src/config/AudioConfig.ts` 中调整：

```typescript
export const DefaultAudioSettings = {
    BGM_VOLUME: 0.5,    // 背景音乐音量 (0-1)
    SFX_VOLUME: 0.7,    // 音效音量 (0-1)
};
```

**推荐设置**：
- BGM: 0.4-0.6（不要盖过音效）
- SFX: 0.6-0.8（反馈要清晰）

---

## ✅ 音效检查清单

- [ ] 所有BGM可以正常循环播放
- [ ] 点击音效不会过于刺耳
- [ ] 抽卡SSR音效有震撼感
- [ ] 战斗音效区分不同技能
- [ ] 胜利/失败音效情绪表达准确
- [ ] 音量平衡（BGM不盖过SFX）

---

## 📊 音效统计

| 类型 | 数量 | 状态 |
|:---|:---:|:---:|
| BGM | 5首 | ✅ 完成 |
| SFX | 15个 | ✅ 完成 |
| 备选变体 | 7个 | ✅ 完成 |
| **总计** | **27个** | ✅ **完成** |

---

## 🎯 下一步

1. **试听所有音效**，标记不喜欢的
2. **替换备选音效**或下载新的
3. **在游戏中测试**实际效果
4. **调整音量平衡**

---

*生成时间: 2026-05-07*  
*总音效数: 27个*  
*格式: MP3 (128kbps)*
