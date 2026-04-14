# 国内AI工具生成UI方案

## 🚀 可用工具

### 1. 豆包 (火山引擎)
**网址**: https://www.doubao.com/

**能力**:
- ✅ 文生图（支持中文Prompt）
- ✅ 图像编辑
- ✅ 智能体创建
- ✅ 代码生成

**优势**:
- 中文理解更好
- 国内访问稳定
- 免费额度充足

---

### 2. 智谱AI (GLM-4)
**网址**: https://open.bigmodel.cn/

**能力**:
- ✅ CogView-3 图像生成
- ✅ ChatGLM-4 对话
- ✅ 代码生成
- ✅ API调用

**优势**:
- 图像质量高
- 支持API批量生成
- 专业图像模型

---

### 3. 其他国内工具

| 工具 | 网址 | 特点 |
|:---|:---|:---|
| 文心一格 | https://yige.baidu.com/ | 百度出品，中文好 |
| 通义万相 | https://tongyi.aliyun.com/wanxiang/ | 阿里出品，免费额度多 |
| 讯飞星火 | https://xinghuo.xfyun.cn/ | 讯飞出品，多模态 |
| 腾讯混元 | https://hunyuan.tencent.com/ | 腾讯出品，游戏场景优化 |

---

## 🎨 UI设计生成方案

### 方案一：纯文本描述 → 豆包生成

#### 主界面生成

**Prompt**:
```
生成一个手机游戏主界面UI设计图，要求：

【基本信息】
- 画布尺寸：750x1334像素（竖屏）
- 游戏类型：萌宠合成游戏
- 风格：可爱治愈系、扁平化设计

【色彩方案】
- 主色：樱花粉 #FF9A9E
- 辅色：薄荷绿 #A8E6CF
- 背景：奶油白 #FFF5F7
- 强调色：阳光黄 #FFD93D

【布局结构】
顶部状态栏（100px高）：
- 左侧：金币图标 + 数量（9999）
- 中间：钻石图标 + 数量（999）
- 右侧：体力图标 + 数量（100/100）

中间区域（900px高）：
- 5x5白色格子网格，每个格子100x100px
- 格子圆角20px，轻微阴影
- 部分格子中有可爱的萌宠

底部导航栏（100px高）：
- 5个图标按钮：首页、背包、抽卡、排行、设置
- 图标风格统一，线性图标

【装饰元素】
- 漂浮的星星粒子
- 柔和的光晕效果
- 圆角卡片设计

【输出要求】
- 高清PNG格式
- 背景透明或纯色
- 可直接用于游戏开发
```

---

### 方案二：智谱CogView-3生成

#### API调用方式

```python
import requests
import json

def generate_ui(prompt, width=750, height=1334):
    url = "https://open.bigmodel.cn/api/paas/v4/images/generations"
    
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "cogview-3",
        "prompt": prompt,
        "size": f"{width}x{height}",
        "n": 4,  # 生成4张选择
        "quality": "high"
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# 生成主界面
ui_prompt = """
Mobile game UI design, pet merge game, 
750x1334px portrait, cute kawaii style,
pink #FF9A9E and mint #A8E6CF colors,
top bar with resources, center 5x5 grid,
bottom navigation, rounded corners,
soft shadows, flat design, clean UI
"""

result = generate_ui(ui_prompt)
```

---

## 🐱 萌宠原画生成

### 豆包生成Prompt

#### 小仓鼠
```
生成一只可爱的Q版仓鼠游戏角色：

【角色设定】
- 名称：小仓鼠
- 属性：普通系
- 稀有度：N级

【外观特征】
- 体型：圆滚滚的球形身体
- 毛色：橙白相间
- 耳朵：小小的粉色耳朵
- 眼睛：又大又圆的黑色眼睛，闪闪发光
- 动作：抱着一颗瓜子
- 表情：开心满足

【风格要求】
- Q版2头身比例
- 卡通风格
- 线条简洁流畅
- 色彩明亮饱和
- 白色背景

【用途】
- 游戏角色立绘
- 需要透明背景
- 256x256像素
```

#### 小兔子
```
生成一只可爱的Q版兔子游戏角色：

【角色设定】
- 名称：小兔子
- 属性：草系
- 稀有度：N级

【外观特征】
- 体型：圆润可爱
- 毛色：纯白色
- 耳朵：长长的耳朵，内侧粉色
- 眼睛：红宝石般的红色大眼睛
- 尾巴：毛茸茸的圆球尾巴
- 动作：抱着一根胡萝卜
- 表情：活泼可爱

【风格要求】
- Q版2头身
- 萌系画风
- 柔和的光影
- 白色背景
- 256x256像素
```

### 智谱API批量生成

```python
pets = [
    {"name": "仓鼠", "element": "普通", "color": "橙白"},
    {"name": "兔子", "element": "草", "color": "白色"},
    {"name": "猫咪", "element": "火", "color": "橘色"},
    {"name": "狗狗", "element": "普通", "color": "棕白"},
    {"name": "狐狸", "element": "火", "color": "红色"},
    {"name": "小熊", "element": "普通", "color": "棕色"},
    {"name": "熊猫", "element": "普通", "color": "黑白"},
    {"name": "企鹅", "element": "水", "color": "黑白"},
    {"name": "小龙", "element": "火", "color": "红色"},
    {"name": "独角兽", "element": "光", "color": "白色"}
]

for pet in pets:
    prompt = f"""
    Cute chibi {pet['name']} character, game asset,
    {pet['color']} color, {pet['element']} element type,
    round body, big sparkling eyes, kawaii style,
    white background, 2D illustration, 256x256px
    """
    
    result = generate_ui(prompt, 256, 256)
    print(f"Generated: {pet['name']}")
```

---

## 🎯 图标生成

### 豆包生成图标

#### 首页图标
```
生成一个游戏UI图标：

【图标信息】
- 名称：首页图标
- 尺寸：64x64像素
- 风格：扁平化设计

【设计元素】
- 主体：可爱的房子形状
- 细节：屋顶有心形装饰
- 颜色：樱花粉 #FF9A9E
- 线条：圆润的线条
- 背景：透明

【风格要求】
- 简洁明了
- 易于识别
- 与其他图标风格统一
- 游戏UI风格
```

#### 批量图标Prompt模板
```
生成一组游戏UI图标（5个），要求：

图标列表：
1. 首页 - 房子图标
2. 背包 - 背包图标
3. 抽卡 - 水晶球图标
4. 排行 - 奖杯图标
5. 设置 - 齿轮图标

统一风格：
- 尺寸：64x64像素
- 风格：扁平化、线性图标
- 颜色：樱花粉 #FF9A9E
- 线条：2px粗细，圆角
- 背景：透明

输出：每个图标单独一张图，PNG格式
```

---

## 🖼️ 场景背景生成

### 主界面背景

**豆包Prompt**:
```
生成一个游戏主界面背景图：

【场景描述】
- 类型：萌宠家园
- 风格：治愈系插画
- 尺寸：750x1334像素（竖屏）

【画面元素】
- 前景：柔软的草地，彩色小花
- 中景：可爱的小木屋，烟囱冒烟
- 背景：蓝天白云，彩虹
- 装饰：蝴蝶飞舞，蒲公英飘散

【色彩氛围】
- 主色调：温暖的粉色和绿色
- 光线：柔和的阳光
- 氛围：温馨、梦幻、治愈

【风格参考】
- 吉卜力工作室风格
- 手绘质感
- 色彩明亮但不刺眼

【技术要求】
- 高清画质
- 无UI元素
- 可直接作为游戏背景
```

### 智谱API生成

```python
background_prompt = """
Cute game background, magical pet home,
750x1334px portrait, soft rolling hills,
colorful flowers, small cozy cottage,
rainbow in sky, fluffy clouds, butterflies,
warm sunlight, Studio Ghibli style,
pastel colors, dreamy atmosphere,
no UI elements, game art
"""

result = generate_ui(background_prompt, 750, 1334)
```

---

## ⚡ 特效生成

### 合成特效

**豆包Prompt**:
```
生成一个游戏特效图：

【特效类型】萌宠合成成功特效
【尺寸】512x512像素
【背景】透明背景

【特效元素】
- 中心：明亮的光爆效果
- 周围：金色的星星和粒子
- 光线：放射状光芒
- 颜色：金色、白色、粉色

【风格】
- 魔法感
- 庆祝氛围
- 卡通风格
- 适合游戏使用

【格式】
- PNG格式
- 透明背景
- 可叠加使用
```

---

## 📊 生成计划

### 使用豆包（免费）

| 资源 | 数量 | 预计时间 | 操作 |
|:---|:---:|:---:|:---|
| UI界面 | 8个 | 2小时 | 逐个生成，描述详细 |
| 萌宠原画 | 30张 | 3小时 | 10只x3个等级 |
| 图标 | 35个 | 1.5小时 | 批量描述 |
| 背景 | 6张 | 1小时 | 场景描述 |
| 特效 | 10个 | 1小时 | 效果描述 |
| **总计** | **89个** | **8.5小时** | 分2天完成 |

### 使用智谱API（付费）

```python
# 批量生成脚本
import time

resources = {
    "ui": ["main", "gacha", "battle", "bag", "shop", "rank", "setting", "modal"],
    "pets": [f"pet_{i:03d}" for i in range(1, 31)],
    "icons": [f"icon_{i}" for i in range(1, 36)],
    "backgrounds": ["main", "forest", "desert", "ice", "volcano", "gacha"],
    "effects": ["merge", "levelup", "reward", "star", "glow"]
}

for category, items in resources.items():
    for item in items:
        # 生成资源
        generate_resource(category, item)
        time.sleep(2)  # 避免频率限制
```

---

## 🔧 后期处理

### 工具推荐

| 工具 | 用途 | 网址 |
|:---|:---|:---|
| remove.bg | 自动抠图 | https://www.remove.bg/
| 佐糖 | 国产抠图 | https://picwish.cn/
| BigJPG | 图片放大 | https://bigjpg.com/
| 稿定设计 | UI编辑 | https://www.gaoding.com/ |

### 处理流程

```
AI生成 → 下载 → 抠图 → 调色 → 放大 → 导出
```

---

## ✅ 今日任务

### 上午（使用豆包）
- [ ] 生成主界面UI
- [ ] 生成5只基础萌宠
- [ ] 生成5个导航图标

### 下午（使用智谱API）
- [ ] 批量生成剩余萌宠
- [ ] 生成场景背景
- [ ] 生成特效元素

### 晚上（后期处理）
- [ ] 统一调色
- [ ] 调整尺寸
- [ ] 导入项目

---

## 💡 提示技巧

### 1. 中文Prompt优化
- 使用具体数字（750x1334，不是"竖屏"）
- 使用颜色代码（#FF9A9E，不是"粉色"）
- 分点描述，结构清晰
- 提供参考风格（吉卜力、迪士尼）

### 2. 风格统一
- 固定描述词：Q版、萌系、卡通
- 固定色彩：明亮、饱和、 pastel
- 固定背景：白色或透明

### 3. 质量提升
- 生成多张选择最佳
- 用PS微调细节
- 保持耐心，多尝试

---

**开始生成吧！豆包和智谱都可以直接使用！** 🚀