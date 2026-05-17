# 萌宠大冒险 - UI素材配置清单

**版本**: 2.0  
**日期**: 2026-05-12  
**用途**: AI批量生成UI素材参考

---

## 一、设计风格总览

| 项目 | 规范 |
|:---|:---|
| 整体风格 | 治愈系Q版扁平插画 + 柔和渐变 |
| 色彩体系 | 马卡龙色系(粉彩)为核心，辅助明亮渐变 |
| 圆角规范 | 按钮圆角16-20px，卡片圆角12-16px，弹窗圆角24px |
| 阴影规范 | 柔和投影(模糊8-12px，偏移0 4px，透明度15%-25%) |
| 字体 | 推荐"站酷快乐体"或"沐瑶软笔手写体"(商用需授权) |
| 设计基准 | iPhone 7/8 (750x1334) @2x |

### AI提示词通用前缀
```
Watercolor painting style, soft pastel colors, kawaii chibi style,
children's book illustration, flat design with soft gradients,
rounded shapes, warm and cozy atmosphere, game UI element,
cute and charming, high quality, detailed
```

---

## 二、场景背景素材 (7张)

| 编号 | 名称 | 用途 | 尺寸(px) | 格式 | AI主题词 |
|:---:|:---|:---|:---:|:---:|:---|
| BG_01 | 主界面_萌宠家园 | 游戏主界面 | 750x1334 | JPG/PNG | 温馨草原、蘑菇小屋、彩虹、白云、野花 |
| BG_02 | 战斗_魔法森林 | 森系战斗 | 750x1334 | JPG/PNG | 魔法森林、巨型蘑菇、藤蔓、光斑、萤火虫 |
| BG_03 | 战斗_神秘沙漠 | 沙漠战斗 | 750x1334 | JPG/PNG | 金色沙漠、金字塔、仙人掌花、夕阳、流沙 |
| BG_04 | 战斗_冰雪王国 | 冰雪战斗 | 750x1334 | JPG/PNG | 冰雪城堡、冰晶柱、雪花、极光、冰瀑布 |
| BG_05 | 战斗_熔岩火山 | 火山战斗 | 750x1334 | JPG/PNG | 红色火山、岩浆河流、暗色岩石、火光、灰烬 |
| BG_06 | 抽卡_星空阵 | 抽卡界面 | 750x1334 | JPG/PNG | 星空魔法阵、旋转星轨、紫蓝渐变、星座图案 |
| BG_07 | 商店_温馨小店 | 商店界面 | 750x1334 | JPG/PNG | 温馨小店内部、木制货架、暖黄灯光、商品柜 |

### 场景分层建议
每张背景分为3层(PSD分层):
- **远景层**: 天空、远山、极光等(模糊处理)
- **中景层**: 主要场景元素(清晰)
- **近景层**: 前景装饰物(可选模糊，增强景深)

---

## 三、按钮素材 (15个)

### 3.1 主按钮 (5个状态)
| 编号 | 名称 | 尺寸(px) | 状态 | 描述 |
|:---:|:---|:---:|:---|:---|
| BTN_PRIMARY_N | 主按钮-普通 | 280x100 | normal | 粉色/橙色渐变圆角矩形，白色文字"确定" |
| BTN_PRIMARY_H | 主按钮-按下 | 280x100 | hover/press | 同尺寸，加深20%色调 |
| BTN_PRIMARY_D | 主按钮-禁用 | 280x100 | disabled | 灰色调+半透明，无阴影 |
| BTN_SECONDARY_N | 次按钮-普通 | 280x100 | normal | 白色填充+彩色描边(3px) |
| BTN_SECONDARY_H | 次按钮-按下 | 280x100 | hover/press | 描边变粗(5px)，背景微变色 |

### 3.2 小按钮/图标按钮 (5个)
| 编号 | 名称 | 尺寸(px) | 用途 |
|:---:|:---|:---:|:---|
| BTN_SMALL_GREEN | 确认小按钮 | 140x60 | 弹窗确认操作 |
| BTN_SMALL_RED | 取消小按钮 | 140x60 | 弹窗取消操作 |
| BTN_ICON_CLOSE | 关闭按钮 | 48x48 | 弹窗右上角关闭 |
| BTN_ICON_BACK | 返回按钮 | 48x48 | 界面左上角返回 |
| BTN_ICON_HELP | 帮助按钮 | 48x48 | 界面右上角帮助/说明 |

### 3.3 导航按钮 (5个)
| 编号 | 名称 | 尺寸(px) | 用途 | 选中态颜色 |
|:---:|:---|:---:|:---|:---|
| NAV_HOME | 首页 | 64x64 | 底部导航-主页 | 粉色 #FF6B8A |
| NAV_BAG | 背包 | 64x64 | 底部导航-背包 | 橙色 #FF9F43 |
| NAV_GACHA | 抽卡 | 64x64 | 底部导航-抽卡 | 紫色 #A55EEA |
| NAV_SHOP | 商店 | 64x64 | 底部导航-商店 | 绿色 #2ED573 |
| NAV_RANK | 排行 | 64x64 | 底部导航-排行 | 金色 #FFC107 |

---

## 四、卡片素材 (12个)

### 4.1 萌宠卡片
| 编号 | 名称 | 尺寸(px) | 用途 | 元素 |
|:---:|:---|:---:|:---|:---|
| CARD_PET_N | N级萌宠卡 | 160x200 | 背包/抽卡展示 | 灰色边框+灰色光效+1星 |
| CARD_PET_R | R级萌宠卡 | 160x200 | 背包/抽卡展示 | 绿色边框+绿色光效+2星 |
| CARD_PET_SR | SR级萌宠卡 | 160x200 | 背包/抽卡展示 | 紫色边框+紫色光效+3星 |
| CARD_PET_SSR | SSR级萌宠卡 | 160x200 | 背包/抽卡展示 | 金色边框+彩虹光效+4星 |
| CARD_PET_UR | UR级萌宠卡 | 160x200 | 背包/抽卡展示 | 红色边框+极光特效+5星 |
| CARD_PET_EMPTY | 空位卡 | 160x200 | 空位占位 | 虚线边框+问号图标 |

### 4.2 其他卡片
| 编号 | 名称 | 尺寸(px) | 用途 |
|:---:|:---|:---:|:---|
| CARD_SKILL | 技能卡片 | 200x280 | 技能选择/展示 |
| CARD_ITEM | 道具卡片 | 120x120 | 道具/物品展示 |
| CARD_REWARD | 奖励卡片 | 600x400 | 结算奖励展示 |
| CARD_ACHIEVE | 成就卡片 | 500x120 | 成就列表项 |
| CARD_TASK | 任务卡片 | 500x120 | 每日任务项 |
| CARD_BATTLEPASS | 通行证卡片 | 400x500 | 通行证奖励展示 |

---

## 五、弹窗面板素材 (8个)

| 编号 | 名称 | 尺寸(px) | 用途 | 背景色 |
|:---:|:---|:---:|:---|:---|
| DIALOG_CONFIRM | 确认弹窗背景 | 600x400 | 二次确认操作 | 白色+阴影 |
| DIALOG_INFO | 信息弹窗背景 | 600x300 | 提示信息展示 | 白色+阴影 |
| DIALOG_REWARD | 奖励弹窗背景 | 700x500 | 获得奖励展示 | 金色边框渐变 |
| DIALOG_DETAIL | 详情弹窗背景 | 700x900 | 萌宠/道具详情 | 白色+滚动 |
| DIALOG_SETTING | 设置弹窗背景 | 650x500 | 游戏设置 | 白色+阴影 |
| DIALOG_GACHA_RESULT | 抽卡结果面板 | 全屏 | 抽卡结果展示 | 星空背景 |
| DIALOG_BATTLE_RESULT | 结算面板 | 全屏 | 战斗结果展示 | 半透明蒙版 |
| PANEL_SKILL_SELECT | 技能选择面板 | 680x350 | 战斗中技能选择 | 游戏内嵌面板 |

---

## 六、图标素材 (35个+)

### 6.1 系统图标 (64x64px, PNG)
| 编号 | 名称 | 描述 | 配色 |
|:---:|:---|:---|:---|
| ICON_GOLD | 金币 | 圆形金币带$符号 | 金色 #FFC107 |
| ICON_DIAMOND | 钻石 | 菱形蓝宝石 | 蓝色 #2196F3 |
| ICON_ENERGY | 体力/能量 | 闪电符号 | 黄色 #FFEB3B |
| ICON_EXP | 经验值 | 星星符号 | 紫色 #9C27B0 |
| ICON_LEVEL | 等级 | 上升箭头+数字 | 橙色 #FF9800 |

### 6.2 属性图标 (64x64px, PNG)
| 编号 | 名称 | 描述 | 配色 |
|:---:|:---|:---|:---|
| ICON_FIRE | 火属性 | 火焰图案 | 红色 #FF5722 |
| ICON_WATER | 水属性 | 水滴图案 | 蓝色 #2196F3 |
| ICON_GRASS | 草属性 | 叶子图案 | 绿色 #4CAF50 |
| ICON_LIGHT | 光属性 | 光芒/星星 | 金色 #FFEB3B |
| ICON_DARK | 暗属性 | 月牙/暗影 | 紫色 #673AB7 |

### 6.3 战斗属性图标 (48x48px, PNG)
| 编号 | 名称 | 描述 |
|:---:|:---|:---|
| ICON_ATK | 攻击力 | 剑/拳头符号 |
| ICON_DEF | 防御力 | 盾牌符号 |
| ICON_HP | 生命值 | 心形符号 |
| ICON_SPD | 速度 | 翅膀/闪电符号 |
| ICON_CRIT | 暴击率 | 爆炸/星号符号 |

### 6.4 功能图标 (64x64px, PNG)
| 编号 | 名称 | 用途 | 描述 |
|:---:|:---|:---|:---|
| ICON_SHARE | 分享 | 分享按钮 | 箭头+节点 |
| ICON_AD | 广告 | 观看广告按钮 | 播放+礼物 |
| ICON_ADD | 添加 | 添加好友 | +号 |
| ICON_DELETE | 删除 | 删除操作 | 垃圾桶 |
| ICON_LOCK | 锁定 | 未解锁 | 锁符号 |
| ICON_CHECK | 完成 | 已完成 | 对勾 |
| ICON_RANK | 排行 | 排行榜 | 奖杯/皇冠 |
| ICON_SETTING | 设置 | 设置页 | 齿轮 |
| ICON_QUESTION | 帮助 | 说明/帮助 | 问号 |
| ICON_SOUND_ON | 音效开 | 音效开启 | 喇叭+声波 |
| ICON_SOUND_OFF | 音效关 | 音效关闭 | 喇叭+X |

### 6.5 稀有度星标 (32x32px, PNG)
| 编号 | 用途 | 描述 |
|:---:|:---|:---|
| STAR_GRAY | N级空星 | 灰色空心星 |
| STAR_GREEN | R级星 | 绿色实心星 |
| STAR_PURPLE | SR级星 | 紫色实心星+微光 |
| STAR_GOLD | SSR级星 | 金色实心星+光芒 |
| STAR_RED | UR级星 | 红色实心星+特效 |

---

## 七、头像框素材 (12个)

| 编号 | 名称 | 尺寸(px) | 用途 |
|:---:|:---|:---:|:---|
| AVATAR_DEFAULT | 默认头像框 | 32x32 | 新玩家默认 |
| AVATAR_N | N级头像框 | 36x36 | 收集10种N萌宠解锁 |
| AVATAR_R | R级头像框 | 38x38 | 收集10种R萌宠解锁 |
| AVATAR_SR | SR级头像框 | 40x40 | 收集5种SR萌宠解锁 |
| AVATAR_SSR | SSR级头像框 | 44x44 | 收集3种SSR萌宠解锁 |
| AVATAR_UR | UR级头像框 | 48x48 | 收集1种UR萌宠解锁 |
| AVATAR_PVP_GOLD | PVP金框 | 42x42 | PVP排名前10% |
| AVATAR_PVP_DIAMOND | PVP钻石框 | 46x46 | PVP排名前1% |
| AVATAR_EVENT | 活动限定框 | 38x38 | 限时活动获取 |
| AVATAR_SEASON | 赛季框 | 40x40 | 赛季奖励 |
| AVATAR_ANNIVERSARY | 周年框 | 44x44 | 周年庆典限定 |
| AVATAR_MVP | MVP框 | 50x50 | 全服排名第一 |

---

## 八、特效素材 (10个)

### 8.1 粒子贴图 (64x64px, PNG)
| 编号 | 名称 | 用途 | 形状 | 颜色 |
|:---:|:---|:---|:---|:---|
| PTCL_STAR | 星星粒子 | 通用特效 | 四角星，渐变 | 金色到白色 |
| PTCL_CIRCLE | 圆形粒子 | 光点效果 | 圆形，柔和边缘 | 多种颜色 |
| PTCL_HEART | 心形粒子 | 治愈/爱心效果 | 爱心，渐变 | 粉色到红色 |
| PTCL_SPARK | 火花粒子 | 火焰/打击效果 | 不规则，锐利 | 橙色到黄色 |
| PTCL_LEAF | 叶子粒子 | 草系/自然效果 | 小叶子形状 | 绿色渐变 |
| PTCL_SNOW | 雪花粒子 | 冰系效果 | 六角雪花 | 白色半透明 |
| PTCL_SHARD | 碎片粒子 | 暗系/破碎效果 | 三角形碎片 | 紫色到黑色 |
| PTCL_GLOW | 光晕贴图 | 光系技能 | 圆形柔光 | 任意色(叠加模式) |

### 8.2 特效帧动画 (精灵图/sprite sheet)
| 编号 | 名称 | 帧数 | 尺寸(px) | 用途 |
|:---:|:---|:---:|:---:|:---|
| ANIM_MERGE | 合成特效 | 12帧 | 256x256 | 萌宠合成时的魔法阵+光芒 |
| ANIM_EVOLVE | 进化特效 | 16帧 | 256x256 | 萌宠进化时的光柱+变身 |
| ANIM_GACHA_RARE | SR抽卡光效 | 8帧 | 512x512 | SR级抽卡揭晓特效 |
| ANIM_GACHA_SSR | SSR抽卡光效 | 12帧 | 512x512 | SSR级抽卡揭晓特效 |
| ANIM_GACHA_UR | UR抽卡光效 | 16帧 | 512x512 | UR级抽卡揭晓特效(最强) |
| ANIM_VICTORY | 胜利特效 | 10帧 | 750x500 | 战斗胜利时的庆祝特效 |
| ANIM_LEVELUP | 升级特效 | 8帧 | 200x200 | 升级时的光环上升特效 |
| ANIM_BUFF | 增益特效 | 6帧 | 128x128 | 属性增益上浮特效 |
| ANIM_DEBUFF | 减益特效 | 6帧 | 128x128 | 属性减益下沉特效 |
| ANIM_HIT | 受击特效 | 4帧 | 128x128 | 受击时闪烁/星特效 |

---

## 九、进度条/滑块素材 (6个)

| 编号 | 名称 | 尺寸(px) | 用途 |
|:---:|:---|:---:|:---|
| BAR_HP_BG | 血条背景 | 200x16 | 生命值条背景(灰色) |
| BAR_HP_FILL | 血条填充 | 200x16 | 生命值条填充(绿色渐变→红) |
| BAR_EXP_BG | 经验条背景 | 300x20 | 经验值条背景(深色) |
| BAR_EXP_FILL | 经验条填充 | 300x20 | 经验值条填充(蓝紫色渐变) |
| BAR_ENERGY_BG | 体力条背景 | 150x12 | 体力值条背景 |
| BAR_ENERGY_FILL | 体力条填充 | 150x12 | 体力值条填充(黄色渐变) |

---

## 十、状态标记素材 (8个)

| 编号 | 名称 | 尺寸(px) | 用途 |
|:---:|:---|:---:|:---|
| TAG_NEW | 新标签 | 50x28 | 新获得的物品标记 |
| TAG_HOT | 热门标签 | 50x28 | 热门活动/商品标记 |
| TAG_LIMITED | 限定标签 | 50x28 | 限定/限时标记 |
| TAG_SALE | 折扣标签 | 50x28 | 折扣商品标记 |
| TAG_FREE | 免费标签 | 50x28 | 免费领取标记 |
| TAG_LOCKED | 锁定标记 | 60x60 | 未解锁内容 |
| TAG_CHECK | 已拥有标记 | 60x60 | 已收集标记 |
| TAG_COMPLETE | 完成标记 | 60x60 | 任务/成就完成 |

---

## 十一、Loading/过渡素材 (4个)

| 编号 | 名称 | 尺寸(px) | 用途 |
|:---:|:---|:---:|:---|
| LOADING_SPINNER | 加载转圈 | 64x64 | 数据加载中动画(12帧旋转) |
| LOADING_BAR | 加载进度条 | 400x16 | 资源加载进度条 |
| LOADING_LOGO | 启动Logo | 256x256 | 游戏启动时的Logo |
| TRANSITION_FADE | 转场遮罩 | 全屏 | 黑色半透明渐变遮罩 |

---

## 十二、特殊界面素材 (5个)

| 编号 | 名称 | 尺寸(px) | 用途 |
|:---:|:---|:---:|:---|
| TITLE_LOGO | 游戏标题Logo | 500x200 | 主界面标题"萌宠大冒险" |
| SPRITE_GACHA_MACHINE | 抽卡机 | 400x500 | 抽卡机/扭蛋机图片 |
| SPRITE_CHEST_NORMAL | 普通宝箱 | 120x120 | N/R级奖励宝箱 |
| SPRITE_CHEST_RARE | 稀有宝箱 | 140x140 | SR/SSR级奖励宝箱 |
| SPRITE_CHEST_LEGEND | 传说宝箱 | 160x160 | UR级奖励宝箱 |

---

## 十三、资源规格汇总表

| 类别 | 数量 | 格式 | 尺寸范围 | 建议生成方式 |
|:---|:---:|:---|:---|:---|
| 场景背景 | 7 | JPG/PNG | 750x1334 | Midjourney/Stable Diffusion |
| 按钮类 | 15 | PNG | 48~280px | 设计工具(Figma/PS) |
| 卡片类 | 12 | PNG | 120~600px | 设计工具+AI |
| 弹窗面板 | 8 | PNG | 300~全屏 | 设计工具 |
| 功能图标 | 35 | PNG | 32~64px | AI生成+手动调整 |
| 头像框 | 12 | PNG | 32~50px | 设计工具 |
| 粒子贴图 | 8 | PNG | 64x64 | Photoshop/粒子工具 |
| 帧动画 | 10 | PNG精灵图 | 128~750px | After Effects/Spine |
| 进度条 | 6 | PNG | 12~20px高 | 设计工具(简单) |
| 状态标记 | 8 | PNG | 28~60px | 设计工具 |
| Loading | 4 | PNG | 64~全屏 | 设计工具+动画 |
| 特殊界面 | 5 | PNG | 120~500px | AI+设计工具 |
| **总计** | **~130** | | | |

---

## 十四、AI批量生成操作指南

### 14.1 使用Midjourney批量生成图标
```
提示词模板:
A game icon of [subject], pixel-perfect, flat vector style,
soft pastel colors, rounded shapes, kawaii style,
on transparent background, centered, simple design,
high quality, 4k

示例:
A game icon of gold coin, pixel-perfect, flat vector style,
soft pastel yellow and orange colors, rounded shapes, kawaii style,
on transparent background, centered, simple design,
high quality, 4k --ar 1:1 --style raw
```

### 14.2 使用Stable Diffusion批量生成卡片
```
提示词模板:
game card frame, [rarity] quality, [color] border,
ornate decorations, soft gradients, cute style,
rounded corners, on transparent background,
high quality, detailed

负面提示词:
text, watermark, signature, realistic, 3d, photo
```

### 14.3 推荐AI工具组合
| 用途 | 推荐工具 | 说明 |
|:---|:---|:---|
| 场景背景 | Midjourney v6/Stable Diffusion | 高质量场景插画 |
| 图标批量 | Leonardo AI / Recraft V3 | 批量生成风格统一图标 |
| 按钮/UI组件 | Figma + AI插件 | 标准化UI组件 |
| 粒子贴图 | Photoshop | 简单绘制即可 |
| 帧动画 | After Effects + Bodymovin | 导出序列帧 |
| Logo设计 | Looka / Canva AI | 快速Logo方案 |

### 14.4 批量生成文件命名规范
```
格式: {类别}_{编号}_{名称}.{格式}
示例:
- bg_01_main_home.jpg         (场景背景)
- btn_primary_normal.png      (按钮)
- card_pet_ssr.png            (卡片)
- icon_gold.png               (图标)
- ptcl_star.png               (粒子)
- anim_merge_sheet.png        (动画精灵图)
```

---

## 十五、优先级与排期建议

### P0 (核心必备，第一批生成)
- ✅ 场景背景 7张
- ✅ 主/次/导航按钮 10个
- ✅ 萌宠卡片 6个
- ✅ 图标 20个(金币、钻石、体力、属性等)
- ✅ 进度条 6个
- **预估AI生成耗时**: 2-3天

### P1 (功能完善，第二批生成)
- ✅ 弹窗面板 8个
- ✅ 状态标记 8个
- ✅ 特殊界面 5个
- ✅ 剩余图标 15个
- ✅ 头像框 12个
- **预估AI生成耗时**: 2-3天

### P2 (锦上添花，第三批生成)
- ✅ 帧动画 10个
- ✅ 粒子贴图 8个
- ✅ Loading素材 4个
- ✅ 技能卡片等补充素材
- **预估AI生成耗时**: 3-5天

---

**本清单约130个UI素材，建议分3批用AI工具生成，预计总耗时7-10天。**
