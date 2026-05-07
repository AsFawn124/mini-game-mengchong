# 前端页面显示问题检查报告

## 检查时间：2026-05-06
## 检查范围：所有UI场景和组件

---

## 一、测试环境

- **引擎**: Cocos Creator 3.x
- **语言**: TypeScript
- **平台**: 微信小游戏
- **分辨率**: 750x1334 (竖屏)

---

## 二、页面检查清单

### 2.1 主场景UI (MainSceneUI.ts)

| 检查项 | 状态 | 问题 | 严重程度 |
|:---|:---:|:---|:---:|
| 金币显示 | ⚠️ | 使用formatNumber但未导入 | 中 |
| 钻石显示 | ⚠️ | 使用formatNumber但未导入 | 中 |
| 萌宠容器 | ⚠️ | 未处理空状态 | 低 |
| 按钮点击 | ✅ | 正常 | - |
| 场景切换 | ✅ | 正常 | - |
| 顶部信息栏 | ⚠️ | 缺少返回按钮 | 低 |
| 底部导航栏 | ⚠️ | 未高亮当前选中 | 低 |

**发现的问题：**

1. **formatNumber未导入**
```typescript
// 问题代码
this.goldLabel.string = this._formatNumber(this._userData.gold);

// 修复：添加导入
import { formatNumber } from '../utils/GameUtils';
```

2. **萌宠容器空状态未处理**
```typescript
// 应该添加空状态提示
if (team.length === 0) {
    this._showEmptyState();
}
```

### 2.2 战斗场景UI (BattleSceneUI.ts)

| 检查项 | 状态 | 问题 | 严重程度 |
|:---|:---:|:---|:---:|
| 波数显示 | ✅ | 正常 | - |
| 血条更新 | ⚠️ | 动画效果未实现 | 中 |
| 技能选择面板 | ⚠️ | 未处理无技能情况 | 中 |
| 战斗动画 | ⚠️ | 缺少攻击动画 | 高 |
| 伤害数字 | ⚠️ | 显示位置可能超出屏幕 | 中 |
| 暂停功能 | ✅ | 正常 | - |
| 结果面板 | ⚠️ | 缺少再试一次按钮 | 低 |

**发现的问题：**

1. **血条动画未实现**
```typescript
// 当前代码
fillNode.scaleX = Math.max(0, ratio);

// 应该使用动画
cc.tween(fillNode).to(0.3, { scaleX: ratio }).start();
```

2. **伤害数字位置问题**
```typescript
// 需要检查是否超出屏幕边界
const worldPos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
if (worldPos.y > cc.winSize.height) {
    damageNode.y = cc.winSize.height - worldPos.y - 50;
}
```

### 2.3 抽卡场景UI (GachaSceneUI.ts)

| 检查项 | 状态 | 问题 | 严重程度 |
|:---|:---:|:---|:---:|
| 单抽按钮 | ✅ | 正常 | - |
| 十连抽按钮 | ✅ | 正常 | - |
| 钻石显示 | ⚠️ | 未实时更新 | 中 |
| 抽卡动画 | ⚠️ | 动画过于简单 | 低 |
| 结果展示 | ⚠️ | 未处理重复萌宠 | 中 |
| 再抽按钮 | ✅ | 正常 | - |

**发现的问题：**

1. **钻石未实时更新**
```typescript
// 抽卡后应该刷新显示
this._diamond -= cost;
this._refreshUI(); // 添加这行
```

2. **重复萌宠提示**
```typescript
// 应该显示"已拥有，转化为碎片"
if (existingPet) {
    this._showConvertToShards(pet);
}
```

### 2.4 背包场景UI (BagSceneUI.ts)

| 检查项 | 状态 | 问题 | 严重程度 |
|:---|:---:|:---|:---:|
| 萌宠列表 | ⚠️ | 未实现滚动 | 高 |
| 萌宠详情 | ✅ | 正常 | - |
| 合成面板 | ⚠️ | 未验证萌宠等级 | 中 |
| 上阵功能 | ✅ | 正常 | - |
| 背包容量 | ⚠️ | 未显示已满提示 | 中 |
| 筛选功能 | ❌ | 未实现 | 低 |

**发现的问题：**

1. **缺少滚动视图**
```typescript
// 应该使用ScrollView
@property(cc.ScrollView)
petListScrollView: cc.ScrollView = null;
```

2. **合成未验证等级**
```typescript
// 应该检查等级是否相同
if (!pets.every(p => p.level === pets[0].level)) {
    this._showToast('等级不同的萌宠无法合成');
    return;
}
```

### 2.5 好友场景UI (FriendSceneUI.ts)

| 检查项 | 状态 | 问题 | 严重程度 |
|:---|:---:|:---|:---:|
| 好友列表 | ⚠️ | 未实现滚动 | 高 |
| 搜索功能 | ✅ | 正常 | - |
| 请求处理 | ✅ | 正常 | - |
| 赠送体力 | ⚠️ | 未显示今日剩余次数 | 低 |
| 助战功能 | ⚠️ | 未实现助战选择 | 中 |
| 在线状态 | ⚠️ | 未实时更新 | 低 |

---

## 三、通用问题

### 3.1 代码规范问题

| 问题 | 影响文件 | 严重程度 |
|:---|:---|:---:|
| 缺少类型定义 | 多个文件 | 中 |
| 未使用的导入 | 多个文件 | 低 |
| 魔法数字 | 多个文件 | 低 |
| 缺少错误处理 | 多个文件 | 高 |

### 3.2 性能问题

| 问题 | 影响 | 严重程度 |
|:---|:---|:---:|
| 频繁创建节点 | 战斗场景 | 高 |
| 未使用对象池 | 特效/伤害数字 | 中 |
| 全量刷新UI | 背包/好友 | 中 |

### 3.3 适配问题

| 问题 | 影响 | 严重程度 |
|:---|:---|:---:|
| 未适配全面屏 | 所有场景 | 高 |
| 文字大小固定 | 所有场景 | 中 |
| 按钮尺寸未适配 | 所有场景 | 中 |

---

## 四、修复清单

### 4.1 必须修复（P0）

- [ ] 添加ScrollView到背包和好友列表
- [ ] 实现对象池管理（伤害数字/特效）
- [ ] 添加全面屏适配
- [ ] 修复formatNumber导入问题

### 4.2 建议修复（P1）

- [ ] 添加血条动画
- [ ] 实现钻石实时更新
- [ ] 添加重复萌宠提示
- [ ] 添加空状态提示

### 4.3 可选修复（P2）

- [ ] 优化抽卡动画
- [ ] 添加筛选功能
- [ ] 实现实时在线状态
- [ ] 添加返回按钮统一处理

---

## 五、修复代码

### 5.1 修复formatNumber导入

```typescript
// MainSceneUI.ts
import { formatNumber } from '../utils/GameUtils';

// 修改_refreshUI方法
private _refreshUI(): void {
    this.goldLabel.string = formatNumber(this._userData.gold);
    this.diamondLabel.string = formatNumber(this._userData.diamond);
    this.levelLabel.string = `Lv.${this._userData.level}`;
}
```

### 5.2 添加ScrollView

```typescript
// BagSceneUI.ts
@property(cc.ScrollView)
petListScrollView: cc.ScrollView = null;

// 修改_refreshPetList
private _refreshPetList(): void {
    const content = this.petListScrollView.content;
    content.removeAllChildren();
    
    // 添加列表项...
}
```

### 5.3 添加对象池

```typescript
// BattleSceneUI.ts
import { ObjectPool } from '../utils/GameUtils';

private _damageNumberPool: ObjectPool<cc.Node> = null;

onLoad() {
    // 初始化对象池
    const damagePrefab = new cc.Node('DamagePrefab');
    damagePrefab.addComponent(cc.Label);
    this._damageNumberPool = new ObjectPool(damagePrefab, 20);
}

// 使用对象池
private _showDamage(damage: number): void {
    const damageNode = this._damageNumberPool.get();
    // 设置属性...
    
    // 动画结束后回收
    cc.tween(damageNode)
        .by(0.5, { y: 80 })
        .to(0.3, { opacity: 0 })
        .call(() => {
            this._damageNumberPool.recycle(damageNode);
        })
        .start();
}
```

### 5.4 添加全面屏适配

```typescript
// GameMain.ts
import { ScreenAdapter } from '../utils/GameUtils';

onLoad() {
    // 适配安全区域
    ScreenAdapter.adaptToSafeArea(this.node);
}
```

---

## 六、测试建议

### 6.1 真机测试
- [ ] iPhone 12/13/14/15 系列
- [ ] 华为 Mate/P 系列
- [ ] 小米数字/Redmi 系列
- [ ] 不同屏幕比例（19.5:9, 20:9）

### 6.2 功能测试
- [ ] 所有按钮点击响应
- [ ] 场景切换流畅度
- [ ] 列表滚动性能
- [ ] 动画播放效果

### 6.3 边界测试
- [ ] 背包满100个萌宠
- [ ] 好友满50人
- [ ] 长时间运行（30分钟）
- [ ] 快速连续操作

---

## 七、总结

| 类别 | 问题数 | 已修复 | 待修复 |
|:---|:---:|:---:|:---:|
| P0（严重） | 4 | 0 | 4 |
| P1（中等） | 6 | 0 | 6 |
| P2（轻微） | 8 | 0 | 8 |
| **总计** | **18** | **0** | **18** |

**建议优先级：**
1. 立即修复P0问题（影响使用）
2. 1周内修复P1问题（影响体验）
3. 后续版本修复P2问题（优化）
