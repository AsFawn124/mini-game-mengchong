# AI美术资源生成指南

## 推荐工具

### 1. 萌宠原画生成
**工具**: Midjourney / Stable Diffusion / DALL-E 3

**Prompt模板**:
```
A cute [element] pet, [animal type], [rarity] quality, 
chibi style, big eyes, fluffy, game character design, 
white background, 2D game art, high quality, 4k
```

**示例**:
- N级: "A cute fire pet, small flame spirit, common quality, chibi style..."
- R级: "A cute fire pet, flame cat, rare quality, chibi style..."
- SR级: "A cute fire pet, phoenix, epic quality, chibi style..."
- SSR级: "A cute fire pet, fire dragon, legendary quality, chibi style..."

### 2. UI界面生成
**工具**: Galileo AI / Midjourney

**Prompt模板**:
```
Mobile game UI, [screen type], cute style, pink and blue theme,
clean design, buttons and panels, game interface, 2D UI design
```

### 3. 图标生成
**工具**: Leonardo.ai / Midjourney

**Prompt模板**:
```
Game icon, [item type], cute style, simple design,
white background, 2D game asset, high quality
```

## 生成清单

### 萌宠原画 (50只)

#### N级萌宠 (20只)
| 编号 | 名称 | 属性 | 动物类型 |
|:---:|:---:|:---:|:---:|
| n001 | 小火苗 | 火 | 火焰精灵 |
| n002 | 水滴仔 | 水 | 水滴 |
| n003 | 绿叶怪 | 草 | 叶子 |
| n004 | 闪电鼠 | 火 | 老鼠 |
| n005 | 泡泡鱼 | 水 | 鱼 |
| n006-n020 | ... | ... | ... |

#### R级萌宠 (15只)
| 编号 | 名称 | 属性 | 动物类型 |
|:---:|:---:|:---:|:---:|
| r001 | 火焰喵 | 火 | 猫 |
| r002 | 冰霜兔 | 水 | 兔子 |
| r003 | 雷霆熊 | 火 | 熊 |
| r004 | 治愈狐 | 光 | 狐狸 |
| r005 | 暗影狼 | 暗 | 狼 |
| r006-r015 | ... | ... | ... |

#### SR级萌宠 (10只)
| 编号 | 名称 | 属性 | 动物类型 |
|:---:|:---:|:---:|:---:|
| sr001 | 凤凰 | 火 | 凤凰 |
| sr002 | 冰龙 | 水 | 龙 |
| sr003 | 雷麒麟 | 火 | 麒麟 |
| sr004-sr010 | ... | ... | ... |

#### SSR级萌宠 (5只)
| 编号 | 名称 | 属性 | 动物类型 |
|:---:|:---:|:---:|:---:|
| ssr001 | 圣光天使 | 光 | 天使 |
| ssr002 | 暗黑魔王 | 暗 | 恶魔 |
| ssr003-ssr005 | ... | ... | ... |

### UI素材

#### 按钮
- [ ] 普通按钮 (normal/pressed/disabled)
- [ ] 确认按钮
- [ ] 取消按钮
- [ ] 关闭按钮

#### 面板
- [ ] 主面板背景
- [ ] 弹窗背景
- [ ] 血条背景
- [ ] 血条填充

#### 图标
- [ ] 金币图标
- [ ] 钻石图标
- [ ] 经验图标
- [ ] 属性图标 (火/水/草/光/暗)
- [ ] 稀有度边框 (N/R/SR/SSR)

#### 背景
- [ ] 主场景背景
- [ ] 战斗场景背景
- [ ] 抽卡场景背景
- [ ] 背包场景背景

## 输出规范

### 图片规格
- 格式: PNG (带透明通道)
- 萌宠: 256x256 或 512x512
- UI元素: 根据实际尺寸
- 背景: 750x1334 (竖屏)

### 命名规范
```
pets/
  ├── n001_fire_spirit.png
  ├── r001_flame_cat.png
  └── ssr001_holy_angel.png

ui/
  ├── button_normal.png
  ├── button_pressed.png
  ├── panel_bg.png
  └── icon_gold.png

backgrounds/
  ├── bg_main.png
  ├── bg_battle.png
  └── bg_gacha.png
```

## 快速生成脚本

可以使用以下脚本批量生成Prompt:

```javascript
const pets = [
    { id: 'n001', name: '小火苗', element: 'fire', animal: 'flame spirit' },
    { id: 'n002', name: '水滴仔', element: 'water', animal: 'water drop' },
    // ...
];

pets.forEach(pet => {
    const prompt = `A cute ${pet.element} pet, ${pet.animal}, chibi style, 
                   big eyes, fluffy, game character design, white background, 
                   2D game art, high quality, 4k --ar 1:1`;
    console.log(`${pet.id}: ${prompt}`);
});
```

## 注意事项

1. 保持风格统一，建议同一批次生成
2. 使用参考图确保一致性
3. 生成后可能需要手动调整
4. 注意版权问题，商用需谨慎
