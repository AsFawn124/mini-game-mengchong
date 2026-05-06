# 萌宠大冒险 - 美术资源制作指南

## 制作时间：2026年5月6日

---

## 一、制作方案选择

由于当前环境无法直接运行AI图像生成工具，提供以下三种制作方案：

### 方案A：使用Midjourney（推荐）
- **优点**：质量高，风格统一
- **缺点**：需要订阅，费用约$30/月
- **适用**：高品质商业项目

### 方案B：使用Stable Diffusion
- **优点**：免费，可控性强
- **缺点**：需要本地GPU，学习成本高
- **适用**：技术能力强的团队

### 方案C：外包制作
- **优点**：质量稳定，省心
- **缺点**：成本高，周期长
- **适用**：预算充足的项目

---

## 二、AI生成Prompt库

### 2.1 萌宠原画Prompt

#### N级萌宠（基础款）

```
【n001 小火苗】
A cute fire element pet, small flame spirit, chibi style, 
big sparkling eyes, fluffy, orange and red color, simple design, 
common quality, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【n002 水滴仔】
A cute water element pet, cute water droplet creature, chibi style, 
big sparkling eyes, transparent blue body, simple design, 
common quality, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【n003 绿叶怪】
A cute grass element pet, small leaf creature, chibi style, 
big sparkling eyes, green color, simple design, 
common quality, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【n004 闪电鼠】
A cute fire element pet, cute mouse with lightning, chibi style, 
big sparkling eyes, yellow color, simple design, 
common quality, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【n005 泡泡鱼】
A cute water element pet, cute bubble fish, chibi style, 
big sparkling eyes, cyan color, simple design, 
common quality, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style
```

#### R级萌宠（进阶款）

```
【r001 火焰喵】
A cute fire element pet, cute fire cat with flame tail, chibi style, 
big sparkling eyes, fluffy, red and orange color, detailed design, 
rare quality, glowing effects, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【r002 冰霜兔】
A cute water element pet, cute ice rabbit, chibi style, 
big sparkling eyes, fluffy, cyan and blue color, detailed design, 
rare quality, glowing effects, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【r003 雷霆熊】
A cute fire element pet, cute thunder bear, chibi style, 
big sparkling eyes, fluffy, purple color, detailed design, 
rare quality, glowing effects, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【r004 治愈狐】
A cute light element pet, cute healing fox, chibi style, 
big sparkling eyes, fluffy, white and gold color, detailed design, 
rare quality, glowing effects, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【r005 暗影狼】
A cute dark element pet, cute shadow wolf, chibi style, 
big sparkling eyes, fluffy, dark purple color, detailed design, 
rare quality, glowing effects, game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style
```

#### SR级萌宠（稀有款）

```
【sr001 凤凰】
A majestic fire phoenix pet, chibi style, big sparkling eyes, 
beautiful feathers, red and gold color, highly detailed, 
epic quality, magical aura, particle effects, 
game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【sr002 冰龙】
A cute water element pet, cute ice dragon, chibi style, 
big sparkling eyes, beautiful scales, cyan and blue color, 
highly detailed, epic quality, magical aura, particle effects, 
game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【sr003 雷麒麟】
A cute fire element pet, cute thunder qilin, chibi style, 
big sparkling eyes, majestic horns, purple and gold color, 
highly detailed, epic quality, magical aura, particle effects, 
game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style
```

#### SSR级萌宠（传说款）

```
【ssr001 圣光天使】
A beautiful holy angel pet, chibi style, big sparkling eyes, 
white wings, golden halo, white and gold color, masterpiece quality, 
legendary, divine aura, spectacular effects, intricate details, 
game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style

【ssr002 暗黑魔王】
A cool dark demon king pet, chibi style, big sparkling eyes, 
black wings, red eyes, black and purple color, masterpiece quality, 
legendary, dark aura, spectacular effects, intricate details, 
game character design, white background, 
2D game art, high quality, 4k, digital art, kawaii style
```

### 2.2 UI素材Prompt

```
【普通按钮】
A cute game button, rounded rectangle, pink gradient, 
soft shadow, 2D game UI asset, white background, 
high quality, clean design

【按下按钮】
A cute game button pressed state, rounded rectangle, 
darker pink, inset shadow, 2D game UI asset, 
white background, high quality

【主面板】
A cute game main panel, rounded rectangle, 
pink and white gradient, decorative border, 
soft shadow, 2D game UI asset, white background, high quality

【金币图标】
A cute gold coin icon, shiny, 3D effect, 
game currency, 2D game UI asset, white background, high quality

【钻石图标】
A cute diamond gem icon, blue crystal, sparkling, 
game premium currency, 2D game UI asset, white background, high quality

【火属性图标】
A cute fire element icon, flame symbol, 
orange and red, game element, 2D game UI asset, 
white background, high quality

【SSR边框】
A cute game card frame, SSR rarity, golden border, 
divine glow, spectacular effect, 2D game UI asset, 
white background, high quality
```

### 2.3 背景图Prompt

```
【主场景背景】
A cute fantasy game main menu background, magical forest, 
pink and blue sky, fluffy clouds, rainbow, 
cute creatures in distance, dreamy atmosphere, 
2D game art, high quality, vertical composition, no UI elements

【战斗场景背景】
A cute fantasy game battle background, magical arena, 
glowing crystals, elemental effects floating, 
pink and purple theme, epic but cute atmosphere, 
2D game art, high quality, vertical composition, no UI elements

【抽卡场景背景】
A cute fantasy game gacha summon background, magical portal, 
sparkles and stars, rainbow colors, mysterious but cute atmosphere, 
2D game art, high quality, vertical composition, no UI elements
```

---

## 三、批量生成脚本

### 3.1 使用Midjourney批量生成

```javascript
// midjourney_batch.js
const pets = [
    { id: 'n001', name: '小火苗', prompt: '...' },
    { id: 'n002', name: '水滴仔', prompt: '...' },
    // ... 全部50只
];

pets.forEach(pet => {
    console.log(`/imagine prompt: ${pet.prompt} --ar 1:1 --v 6`);
});
```

### 3.2 使用Stable Diffusion批量生成

```python
# sd_batch.py
import requests

API_URL = "http://localhost:7860/sdapi/v1/txt2img"

pets = [...]  # 萌宠配置

for pet in pets:
    payload = {
        "prompt": pet['prompt'],
        "negative_prompt": "ugly, deformed, noisy, blurry",
        "width": 512,
        "height": 512,
        "steps": 30,
        "cfg_scale": 7.5
    }
    
    response = requests.post(API_URL, json=payload)
    # 保存图片...
```

---

## 四、资源清单

### 4.1 萌宠原画（50只）

| 等级 | 数量 | 尺寸 | 格式 |
|:---:|:---:|:---:|:---:|
| N级 | 20只 | 512x512 | PNG |
| R级 | 15只 | 512x512 | PNG |
| SR级 | 10只 | 512x512 | PNG |
| SSR级 | 5只 | 512x512 | PNG |

### 4.2 UI素材

| 类型 | 数量 | 尺寸 | 格式 |
|:---|:---:|:---:|:---:|
| 按钮 | 5个 | 自适应 | PNG |
| 面板 | 3个 | 自适应 | PNG |
| 图标 | 13个 | 128x128 | PNG |
| 血条 | 2个 | 自适应 | PNG |

### 4.3 背景图

| 场景 | 数量 | 尺寸 | 格式 |
|:---|:---:|:---:|:---:|
| 主场景 | 1张 | 750x1334 | PNG/JPG |
| 战斗场景 | 1张 | 750x1334 | PNG/JPG |
| 抽卡场景 | 1张 | 750x1334 | PNG/JPG |
| 背包场景 | 1张 | 750x1334 | PNG/JPG |
| 好友场景 | 1张 | 750x1334 | PNG/JPG |

### 4.4 特效（可选）

| 类型 | 数量 | 格式 |
|:---|:---:|:---:|
| 攻击特效 | 5个 | 帧动画/粒子 |
| 技能特效 | 10个 | 帧动画/粒子 |
| UI特效 | 5个 | 帧动画 |

---

## 五、制作流程

### 5.1 AI生成流程

1. **准备Prompt**
   - 使用本指南提供的Prompt
   - 根据实际效果微调

2. **批量生成**
   - 使用批量生成脚本
   - 建议分批生成，每批10张

3. **筛选优化**
   - 选择最佳结果
   - 使用Upscaling提升分辨率

4. **后期处理**
   - 去除背景（如有需要）
   - 调整尺寸
   - 统一风格

### 5.2 质量检查

- [ ] 风格统一性
- [ ] 分辨率符合要求
- [ ] 透明背景（萌宠）
- [ ] 无水印
- [ ] 命名规范

---

## 六、预算估算

### 6.1 AI生成方案

| 项目 | 数量 | 单价 | 总价 |
|:---|:---:|:---:|:---:|
| Midjourney订阅 | 1个月 | $30 | $30 |
| 图片生成 | 100张 | $0.1 | $10 |
| 后期处理 | - | - | 免费（自己处理）|
| **总计** | | | **约$40** |

### 6.2 外包方案

| 项目 | 数量 | 单价 | 总价 |
|:---|:---:|:---:|:---:|
| 萌宠原画 | 50只 | ¥200 | ¥10,000 |
| UI素材 | 20个 | ¥100 | ¥2,000 |
| 背景图 | 5张 | ¥500 | ¥2,500 |
| **总计** | | | **约¥14,500** |

---

## 七、时间安排

### AI生成方案（1周）

| 阶段 | 时间 | 内容 |
|:---|:---:|:---|
| Day 1 | 4h | 生成N级萌宠20只 |
| Day 2 | 3h | 生成R级萌宠15只 |
| Day 3 | 2h | 生成SR级萌宠10只 |
| Day 4 | 1h | 生成SSR级萌宠5只 |
| Day 5 | 2h | 生成UI素材 |
| Day 6 | 2h | 生成背景图 |
| Day 7 | 2h | 后期处理整理 |

### 外包方案（3-4周）

| 阶段 | 时间 | 内容 |
|:---|:---:|:---|
| Week 1 | - | 需求沟通、合同签订 |
| Week 2-3 | - | 美术制作 |
| Week 4 | - | 修改完善、交付 |

---

## 八、注意事项

1. **版权问题**
   - AI生成图片版权归属需确认
   - 商用需遵守平台规则

2. **风格统一**
   - 使用相同的种子值
   - 保持Prompt结构一致
   - 定期对比检查

3. **文件管理**
   - 按规范命名
   - 分类存放
   - 备份源文件

4. **性能优化**
   - 控制图片大小
   - 使用图集合并
   - 压缩纹理

---

## 九、推荐工具

### AI生成
- Midjourney（质量最高）
- Stable Diffusion（免费）
- DALL-E 3（OpenAI）
- Leonardo.ai（免费额度）

### 后期处理
- Photoshop（专业）
- GIMP（免费）
- Remove.bg（去背景）
- Upscayl（AI放大）

### 文件管理
- Eagle（素材管理）
- Billfish（免费替代）

---

**制作完成后，将资源放入对应目录：**
```
assets/resources/
├── pets/n/     # N级萌宠
├── pets/r/     # R级萌宠
├── pets/sr/    # SR级萌宠
├── pets/ssr/   # SSR级萌宠
├── ui/         # UI素材
├── backgrounds/# 背景图
└── fx/         # 特效
```
