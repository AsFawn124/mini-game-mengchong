# 音效音乐资源清单

**版本**: 1.0  
**日期**: 2026年5月9日  
**来源**: 免费音效网站

---

## BGM音乐 (5首)

| 编号 | 名称 | 用途 | 推荐来源 | 关键词 |
|:---:|:---|:---|:---|:---|
| BGM_01 | 主界面BGM | 游戏主界面 | freesound.org | happy, casual, game, menu, cute |
| BGM_02 | 战斗BGM | 战斗场景 | freesound.org | battle, action, intense, game |
| BGM_03 | 抽卡BGM | 抽卡场景 | freesound.org | gacha, mystery, magical, anticipation |
| BGM_04 | 胜利BGM | 战斗胜利 | freesound.org | victory, win, celebration, fanfare |
| BGM_05 | 探索BGM | 冒险探索 | freesound.org | adventure, exploration, peaceful, nature |

**推荐网站**:
- https://freesound.org/
- https://opengameart.org/
- https://itch.io/soundtracks
- https://www.zapsplat.com/

---

## 音效列表 (30个)

### UI音效 (10个)
| 编号 | 名称 | 用途 | 推荐来源 |
|:---:|:---|:---|:---|
| SFX_UI_01 | 按钮点击 | 按钮点击反馈 | freesound.org |
| SFX_UI_02 | 界面打开 | 弹窗/界面出现 | freesound.org |
| SFX_UI_03 | 界面关闭 | 弹窗/界面关闭 | freesound.org |
| SFX_UI_04 | 确认音效 | 确认操作 | freesound.org |
| SFX_UI_05 | 取消音效 | 取消/返回 | freesound.org |
| SFX_UI_06 | 错误提示 | 操作错误 | freesound.org |
| SFX_UI_07 | 获得奖励 | 获得物品/奖励 | freesound.org |
| SFX_UI_08 | 升级音效 | 角色/宠物升级 | freesound.org |
| SFX_UI_09 | 滑动音效 | 列表滑动 | freesound.org |
| SFX_UI_10 | 提示音效 | 系统提示 | freesound.org |

### 战斗音效 (10个)
| 编号 | 名称 | 用途 | 推荐来源 |
|:---:|:---|:---|:---|
| SFX_BATTLE_01 | 普通攻击 | 基础攻击 | freesound.org |
| SFX_BATTLE_02 | 火属性攻击 | 火焰技能 | freesound.org |
| SFX_BATTLE_03 | 水属性攻击 | 水系技能 | freesound.org |
| SFX_BATTLE_04 | 草属性攻击 | 草系技能 | freesound.org |
| SFX_BATTLE_05 | 光属性攻击 | 光系技能 | freesound.org |
| SFX_BATTLE_06 | 暗属性攻击 | 暗系技能 | freesound.org |
| SFX_BATTLE_07 | 技能释放 | 技能发动 | freesound.org |
| SFX_BATTLE_08 | 受到伤害 | 被击中 | freesound.org |
| SFX_BATTLE_09 | 战斗胜利 | 胜利结算 | freesound.org |
| SFX_BATTLE_10 | 战斗失败 | 失败结算 | freesound.org |

### 萌宠音效 (10个)
| 编号 | 名称 | 用途 | 推荐来源 |
|:---:|:---|:---|:---|
| SFX_PET_01 | 召唤音效 | 召唤萌宠 | freesound.org |
| SFX_PET_02 | 进化音效 | 萌宠进化 | freesound.org |
| SFX_PET_03 | 合成音效 | 萌宠合成 | freesound.org |
| SFX_PET_04 | 萌宠叫声1 | N级叫声 | freesound.org |
| SFX_PET_05 | 萌宠叫声2 | R级叫声 | freesound.org |
| SFX_PET_06 | 萌宠叫声3 | SR级叫声 | freesound.org |
| SFX_PET_07 | 萌宠叫声4 | SSR级叫声 | freesound.org |
| SFX_PET_08 | 开心音效 | 萌宠开心 | freesound.org |
| SFX_PET_09 | 合成成功 | 合成成功 | freesound.org |
| SFX_PET_10 | 稀有出现 | 稀有萌宠出现 | freesound.org |

---

## 音频配置文件

### audio_config.json 更新

```json
{
  "version": "2.0.0",
  "bgm": {
    "main_menu": {
      "file": "audio/bgm/main_menu.mp3",
      "loop": true,
      "volume": 0.7
    },
    "battle": {
      "file": "audio/bgm/battle.mp3",
      "loop": true,
      "volume": 0.8
    },
    "gacha": {
      "file": "audio/bgm/gacha.mp3",
      "loop": false,
      "volume": 0.7
    },
    "victory": {
      "file": "audio/bgm/victory.mp3",
      "loop": false,
      "volume": 0.8
    },
    "exploration": {
      "file": "audio/bgm/exploration.mp3",
      "loop": true,
      "volume": 0.6
    }
  },
  "sfx": {
    "ui_click": {
      "file": "audio/sfx/ui_click.mp3",
      "volume": 0.5
    },
    "ui_open": {
      "file": "audio/sfx/ui_open.mp3",
      "volume": 0.5
    },
    "ui_close": {
      "file": "audio/sfx/ui_close.mp3",
      "volume": 0.5
    },
    "ui_confirm": {
      "file": "audio/sfx/ui_confirm.mp3",
      "volume": 0.6
    },
    "ui_cancel": {
      "file": "audio/sfx/ui_cancel.mp3",
      "volume": 0.5
    },
    "ui_error": {
      "file": "audio/sfx/ui_error.mp3",
      "volume": 0.5
    },
    "reward": {
      "file": "audio/sfx/reward.mp3",
      "volume": 0.7
    },
    "level_up": {
      "file": "audio/sfx/level_up.mp3",
      "volume": 0.8
    },
    "attack_normal": {
      "file": "audio/sfx/attack_normal.mp3",
      "volume": 0.6
    },
    "attack_fire": {
      "file": "audio/sfx/attack_fire.mp3",
      "volume": 0.7
    },
    "attack_water": {
      "file": "audio/sfx/attack_water.mp3",
      "volume": 0.7
    },
    "attack_grass": {
      "file": "audio/sfx/attack_grass.mp3",
      "volume": 0.7
    },
    "attack_light": {
      "file": "audio/sfx/attack_light.mp3",
      "volume": 0.7
    },
    "attack_dark": {
      "file": "audio/sfx/attack_dark.mp3",
      "volume": 0.7
    },
    "skill_cast": {
      "file": "audio/sfx/skill_cast.mp3",
      "volume": 0.8
    },
    "hit_damage": {
      "file": "audio/sfx/hit_damage.mp3",
      "volume": 0.6
    },
    "battle_win": {
      "file": "audio/sfx/battle_win.mp3",
      "volume": 0.8
    },
    "battle_lose": {
      "file": "audio/sfx/battle_lose.mp3",
      "volume": 0.6
    },
    "pet_summon": {
      "file": "audio/sfx/pet_summon.mp3",
      "volume": 0.8
    },
    "pet_evolve": {
      "file": "audio/sfx/pet_evolve.mp3",
      "volume": 0.9
    },
    "pet_merge": {
      "file": "audio/sfx/pet_merge.mp3",
      "volume": 0.7
    },
    "pet_rare": {
      "file": "audio/sfx/pet_rare.mp3",
      "volume": 1.0
    },
    "gacha_rare": {
      "file": "audio/sfx/gacha_rare.mp3",
      "volume": 1.0
    }
  }
}
```

---

## 音频文件目录结构

```
assets/
└── audio/
    ├── bgm/
    │   ├── main_menu.mp3
    │   ├── battle.mp3
    │   ├── gacha.mp3
    │   ├── victory.mp3
    │   └── exploration.mp3
    └── sfx/
        ├── ui_click.mp3
        ├── ui_open.mp3
        ├── ui_close.mp3
        ├── ui_confirm.mp3
        ├── ui_cancel.mp3
        ├── ui_error.mp3
        ├── reward.mp3
        ├── level_up.mp3
        ├── attack_normal.mp3
        ├── attack_fire.mp3
        ├── attack_water.mp3
        ├── attack_grass.mp3
        ├── attack_light.mp3
        ├── attack_dark.mp3
        ├── skill_cast.mp3
        ├── hit_damage.mp3
        ├── battle_win.mp3
        ├── battle_lose.mp3
        ├── pet_summon.mp3
        ├── pet_evolve.mp3
        ├── pet_merge.mp3
        ├── pet_rare.mp3
        └── gacha_rare.mp3
```

---

## 免费音效资源推荐

### 推荐音效包
1. **CC0 Game Sounds** - 完全免费商用
2. **8-bit Game Sounds** - 复古游戏风格
3. **Casual Game SFX Pack** - 休闲游戏音效
4. **RPG Sound Effects** - RPG游戏音效

### 搜索关键词
- 按钮音效: "button click", "ui click", "menu select"
- 胜利音效: "victory", "win", "success", "fanfare"
- 攻击音效: "attack", "hit", "impact", "slash"
- 魔法音效: "magic", "spell", "cast", "buff"
- 萌宠音效: "cute", "animal", "creature", "pet"

---

## 注意事项

1. **版权检查**: 使用前确认音效许可证
2. **格式转换**: 统一转换为MP3格式
3. **音量平衡**: 确保所有音效音量一致
4. **文件大小**: 单个音效文件建议 < 100KB
5. **BGM长度**: 建议 60-120秒循环
