# 🎵 萌宠大冒险 - 音效实现指南

> 音效已完全集成到游戏代码中

---

## ✅ 已完成集成

### 主场景 (MainSceneUI.ts)
| 事件 | 音效 | 代码位置 |
|:---|:---|:---|
| 场景加载 | BGMType.MAIN | start() |
| 点击战斗按钮 | SFXType.CLICK | _onBattleClick() |
| 点击抽卡按钮 | SFXType.CLICK | _onGachaClick() |
| 点击背包按钮 | SFXType.CLICK | _onBagClick() |
| 点击商店按钮 | SFXType.CLICK | _onShopClick() |

### 战斗场景 (BattleSceneUI.ts)
| 事件 | 音效 | 代码位置 |
|:---|:---|:---|
| 场景加载 | BGMType.BATTLE | start() |
| 战斗开始 | SFXType.POPUP | _startBattle() |
| 萌宠攻击 | SFXType.ATTACK | _onPetAttack() |
| 敌人攻击 | SFXType.HIT | _onEnemyAttack() |
| 战斗胜利 | playVictory() | _onBattleEnd() |
| 战斗失败 | playDefeat() | _onBattleEnd() |
| 点击暂停 | SFXType.CLICK | _onPauseClick() |
| 点击继续 | SFXType.CLICK | _onContinueClick() |
| 点击退出 | SFXType.CLICK | _onExitClick() |

### 抽卡场景 (GachaSceneUI.ts)
| 事件 | 音效 | 代码位置 |
|:---|:---|:---|
| 场景加载 | BGMType.GACHA | start() |
| 点击单抽 | SFXType.CLICK | _onSingleDraw() |
| 点击十连 | SFXType.CLICK | _onTenDraw() |
| 抽卡动画 | SFXType.GACHA | _performDraw() |
| 抽卡结果 | playGachaByRarity() | _showResult() |
| 再抽一次 | SFXType.CLICK | _onDrawAgain() |
| 返回 | SFXType.CLICK | _onBack() |

---

## 🎮 音效API使用示例

### 基础使用
```typescript
import { AudioManagerNew } from '../managers/AudioManagerNew';
import { BGMType, SFXType } from '../config/AudioConfig';

// 播放BGM
AudioManagerNew.instance?.playBGM(BGMType.MAIN);

// 播放音效
AudioManagerNew.instance?.playSFX(SFXType.CLICK);
```

### 场景切换自动BGM
```typescript
// 根据场景名自动播放对应BGM
AudioManagerNew.instance?.playBGMForScene('BattleScene');
```

### 播放胜利/失败音效组合
```typescript
// 自动播放BGM + SFX组合
AudioManagerNew.instance?.playVictory();
AudioManagerNew.instance?.playDefeat();
```

### 根据稀有度播放抽卡音效
```typescript
// 自动播放抽卡转动 + 结果音效
AudioManagerNew.instance?.playGachaByRarity('SSR');
```

### 根据元素类型播放技能音效
```typescript
// 自动映射元素到对应音效
AudioManagerNew.instance?.playSkillByElement('FIRE');
```

---

## 🔧 音量控制

```typescript
// 设置BGM音量 (0-1)
AudioManagerNew.instance?.setBGMVolume(0.5);

// 设置SFX音量 (0-1)
AudioManagerNew.instance?.setSFXVolume(0.7);

// 静音/取消静音
const isMuted = AudioManagerNew.instance?.toggleMute();

// 获取当前音量
const bgmVol = AudioManagerNew.instance?.bgmVolume;
const sfxVol = AudioManagerNew.instance?.sfxVolume;
```

---

## 📂 音效文件位置

```
assets/audio/
├── bgm_main.mp3           # 主界面BGM
├── bgm_battle.mp3         # 战斗BGM
├── bgm_gacha.mp3          # 抽卡BGM
├── bgm_victory.mp3        # 胜利BGM
├── bgm_defeat.mp3         # 失败BGM
├── sfx_click.mp3          # 点击音效
├── sfx_popup.mp3          # 弹窗音效
├── sfx_close.mp3          # 关闭音效
├── sfx_merge.mp3          # 合成音效
├── sfx_levelup.mp3        # 升级音效
├── sfx_gacha.mp3          # 抽卡转动
├── sfx_gacha_rare.mp3     # 抽中稀有
├── sfx_gacha_ssr.mp3      # 抽中SSR
├── sfx_attack.mp3         # 攻击音效
├── sfx_skill_fire.mp3     # 火技能
├── sfx_skill_ice.mp3      # 冰技能
├── sfx_skill_thunder.mp3  # 雷技能
├── sfx_hit.mp3            # 受击音效
├── sfx_victory.mp3        # 胜利音效
└── sfx_defeat.mp3         # 失败音效
```

---

## 🎯 如何添加新音效

### 1. 添加音效配置
在 `src/config/AudioConfig.ts` 中添加：
```typescript
export enum SFXType {
    // ... 现有音效
    NEW_SOUND = 'new_sound',  // 新增
}

export const AudioPaths = {
    SFX: {
        // ... 现有路径
        [SFXType.NEW_SOUND]: 'audio/sfx_new_sound',
    }
};
```

### 2. 放置音效文件
将MP3文件放入 `assets/audio/sfx_new_sound.mp3`

### 3. 在代码中使用
```typescript
AudioManagerNew.instance?.playSFX(SFXType.NEW_SOUND);
```

---

## 📝 注意事项

1. **音频格式**: 使用MP3格式，兼容微信小游戏
2. **文件大小**: 单个音效建议不超过500KB
3. **BGM时长**: 建议30秒以上，支持循环播放
4. **音量平衡**: BGM音量建议0.4-0.6，SFX音量建议0.6-0.8
5. **预加载**: 游戏启动时调用 `preloadAll()` 预加载音频

---

## ✅ 音效检查清单

- [x] 主场景BGM循环播放
- [x] 战斗场景BGM切换
- [x] 抽卡场景BGM切换
- [x] 所有按钮点击音效
- [x] 战斗攻击音效
- [x] 战斗受击音效
- [x] 胜利/失败音效组合
- [x] 抽卡转动音效
- [x] 抽卡结果音效（根据稀有度）
- [x] 音量控制功能
- [x] 静音功能

---

*文档生成时间: 2026-05-07*  
*音效版本: v1.0*  
*集成状态: ✅ 完成*
