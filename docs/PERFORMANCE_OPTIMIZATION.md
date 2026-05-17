# 萌宠大冒险 - Cocos Creator 小游戏性能优化清单

**版本**: 1.0  
**日期**: 2026-05-12  
**引擎**: Cocos Creator 3.x  
**目标平台**: 微信小游戏

---

## 一、渲染优化

### 1.1 DrawCall 优化

```typescript
// ✅ 好: 使用自动图集合批
// Cocos Creator 会自动将使用同一图集的节点合并DrawCall

// ✅ 好: 制作精灵图集(Atlas)
// 将多个小图合并到大图，减少纹理切换
// 工具: TexturePacker / Cocos内置图集工具

// ✅ 好: 使用Label图集
// 将常用文字制作成位图字体(BMFont)

// ❌ 坏: 每个图片单独纹理文件
// 会导致DrawCall飙升

// 目标: DrawCall < 50 (移动端)
```

### 1.2 纹理优化

```typescript
// 纹理压缩
// 微信小游戏支持: ETC2(Android) / PVRTC(iOS)
// 设置路径: Cocos Creator → 资源面板 → 纹理 → 压缩选项

// 纹理尺寸优化
// ✅ 背景: 最大1024x1024(小于全分辨率,屏幕适配时拉伸)
// ✅ 角色: 256x256 或 512x512
// ✅ UI图标: 64x64
// ✅ 粒子贴图: 64x64

// MipMap
// 场景中缩小的纹理开启MipMap可减少锯齿
// 但UI纹理不要开启(会增加内存1/3)
```

### 1.3 层级管理

```typescript
// ✅ 正确做法: 按功能分层
export enum LayerNames {
  BACKGROUND = 'background',   // 背景层(静态)
  GAME_OBJECTS = 'game',       // 游戏对象层
  EFFECTS = 'effects',         // 特效层
  UI = 'ui',                 // UI层(最高)
}

// 避免: 所有节点都在同一层级
// 避免: 频繁改变节点层级

// 减少透明混合
// 不透明的节点,确保材质opaque=true
// 减少半透明节点数量
```

---

## 二、内存优化

### 2.1 纹理内存

```typescript
// 内存估算(未压缩时):
// 1024x1024 RGBA8888 ≈ 4MB
// 512x512 RGBA8888 ≈ 1MB
// 256x256 RGBA8888 ≈ 256KB

// ✅ 压缩后(ETC2):
// 1024x1024 ≈ 512KB
// 512x512 ≈ 128KB

// 内存预算(微信小游戏):
// Android: 建议 ≤ 300MB纹理内存
// iOS: 建议 ≤ 200MB纹理内存
// 低端机: 建议 ≤ 100MB纹理内存

// 内存监控
setInterval(() => {
  const mem = wx.getPerformance().getEntries();
  console.log('JS Heap:', (mem.memory.usedJSHeapSize / 1024 / 1024).toFixed(1), 'MB');
}, 5000);
```

### 2.2 资源管理

```typescript
// ✅ 懒加载: 只在需要时加载资源
export class ResourceManager {
  private _cache: Map<string, any> = new Map();
  
  async loadResource(key: string, path: string) {
    if (this._cache.has(key)) {
      return this._cache.get(key);
    }
    const res = await resources.load(path);
    this._cache.set(key, res);
    return res;
  }
  
  // ✅ 场景切换时释放旧场景资源
  releaseScene(name: string) {
    director.unloadScene(name);
    assetManager.releaseUnusedAssets();
  }
  
  // ✅ 定期清理未使用资源
  gc() {
    assetManager.releaseUnusedAssets();
    // 微信小游戏手动触发GC
    if (typeof wx !== 'undefined') {
      wx.triggerGC();
    }
  }
}

// ❌ 避免: 启动时预加载所有资源
// ❌ 避免: 资源加载后永不释放
```

### 2.3 对象池

```typescript
// ✅ 使用对象池管理频繁创建销毁的对象
export class NodePool {
  private _pool: Map<string, Node[]> = new Map();
  
  get(prefab: Prefab, key: string): Node {
    const list = this._pool.get(key) || [];
    if (list.length > 0) {
      const node = list.pop()!;
      node.active = true;
      return node;
    }
    return instantiate(prefab);
  }
  
  put(key: string, node: Node) {
    node.active = false;
    node.removeFromParent();
    const list = this._pool.get(key) || [];
    list.push(node);
    this._pool.set(key, list);
  }
  
  clear(key?: string) {
    if (key) {
      const list = this._pool.get(key);
      list?.forEach(n => n.destroy());
      this._pool.delete(key);
    } else {
      this._pool.forEach(list => list.forEach(n => n.destroy()));
      this._pool.clear();
    }
  }
}

// 适用对象池的场景:
// ✅ 子弹/特效/伤害数字
// ✅ 列表item(滚动列表复用)
// ✅ 战斗中频繁出现/消失的节点
// ❌ 唯一UI面板(弹窗直接用)
```

---

## 三、代码优化

### 3.1 Update优化

```typescript
// ❌ 坏: Update中做大量计算
update(dt: number) {
  // 每帧都遍历所有宠物
  this.allPets.forEach(pet => {
    this.checkCollision(pet);  // 每帧都检查
    this.updateAI(pet);        // 每帧都更新
    this.updateAnimation(pet); // 每帧都更新
  });
}

// ✅ 好: 降低检测频率
private _tickTimer: number = 0;
private readonly TICK_INTERVAL = 0.1; // 100ms

update(dt: number) {
  this._tickTimer += dt;
  if (this._tickTimer < this.TICK_INTERVAL) return;
  this._tickTimer = 0;
  
  // 低频检测
  this.checkCollision();
}

// ✅ 好: 事件驱动代替轮询
// 用事件/回调代替每帧检测状态
onDamageReceived(target: PetEntity, damage: number) {
  this.showDamageNumber(target, damage); // 只在发生时处理
  this.updateHpBar(target);
}
```

### 3.2 避免GC压力

```typescript
// ❌ 坏: 频繁创建临时对象
update(dt: number) {
  const pos = new Vec3(x, y, 0);           // 每帧new
  const color = new Color(255, 0, 0, 255); // 每帧new
  node.setPosition(pos);
  sprite.color = color;
}

// ✅ 好: 使用静态/复用对象
private _tempVec3 = new Vec3();
private _tempColor = new Color();

update(dt: number) {
  this._tempVec3.set(x, y, 0);
  this._tempColor.set(255, 0, 0, 255);
  node.setPosition(this._tempVec3);
  sprite.color = this._tempColor;
}

// ❌ 坏: 字符串拼接
const key = "pet_" + id + "_lv" + level;  // 创建新字符串

// ✅ 好: 使用模板/缓存
private _keyCache: Map<string, string> = new Map();
getPetKey(id: number, level: number): string {
  const raw = `${id}_${level}`;
  if (!this._keyCache.has(raw)) {
    this._keyCache.set(raw, `pet_${id}_lv${level}`);
  }
  return this._keyCache.get(raw)!;
}
```

### 3.3 逻辑优化

```typescript
// ✅ 用位运算代替乘除法(在热点路径)
const halfValue = value >> 1;       // 代替 value/2
const doubleValue = value << 1;     // 代替 value*2

// ✅ 减少三角函数调用
// 缓存sin/cos结果，或使用查找表

// ✅ 使用for代替forEach(避免函数调用开销)
for (let i = 0; i < arr.length; i++) {  // 更快
  process(arr[i]);
}
// arr.forEach(item => process(item));  // 较慢
```

---

## 四、微信小游戏专项优化

### 4.1 启动优化

```typescript
// ✅ 启动流程优化
export class GameBootstrap {
  async start() {
    // 1. 只加载启动必需的资源
    await this.loadSplashAssets();
    
    // 2. 显示启动页(提升感知速度)
    this.showSplashScreen();
    
    // 3. 异步加载核心资源
    this.loadCoreAssets().then(() => {
      this.enterMainScene();
    });
    
    // 4. 非核心资源后台预加载
    this.preloadOptionalAssets();
  }
  
  // ✅ 使用微信分包加载
  // game.json 配置:
  // "subPackages": [
  //   { "name": "battle", "root": "assets/battle/" },
  //   { "name": "gacha", "root": "assets/gacha/" }
  // ]
}

// 启动性能指标:
// 冷启动 < 3秒
// 热启动 < 1秒
```

### 4.2 缓存策略

```typescript
// ✅ 利用微信本地缓存
export class CacheManager {
  // 缓存玩家数据
  static async savePlayerData(data: PlayerData) {
    wx.setStorageSync('player_data', JSON.stringify(data));
  }
  
  static loadPlayerData(): PlayerData | null {
    const raw = wx.getStorageSync('player_data');
    return raw ? JSON.parse(raw) : null;
  }
  
  // ✅ 缓存远程资源(减少CDN流量)
  static async cacheRemoteAsset(url: string, key: string) {
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/${key}`;
    
    try {
      fs.accessSync(filePath);
      return filePath; // 已缓存，直接返回
    } catch {
      // 下载并缓存
      const res = await wx.downloadFile({ url });
      fs.saveFileSync(res.tempFilePath, filePath);
      return filePath;
    }
  }
}

// 缓存大小限制: 微信小游戏本地缓存最大200MB
// 建议: 保留最近30天缓存，定期清理旧缓存
```

### 4.3 音频优化

```typescript
// ✅ 使用InnerAudioContext代替cc.audioEngine
// 微信小游戏环境特性
export class WechatAudioManager {
  private _bgmContext: InnerAudioContext;
  private _sfxPool: InnerAudioContext[] = [];
  private readonly SFX_POOL_SIZE = 5;
  
  constructor() {
    this._bgmContext = wx.createInnerAudioContext();
    this._bgmContext.loop = true;
    
    // 预创建音效池
    for (let i = 0; i < this.SFX_POOL_SIZE; i++) {
      this._sfxPool.push(wx.createInnerAudioContext());
    }
  }
  
  playBgm(src: string) {
    this._bgmContext.src = src;
    this._bgmContext.play();
  }
  
  playSfx(src: string) {
    // 从池中获取空闲的音频实例
    const ctx = this._sfxPool.find(c => c.paused) || this._sfxPool[0];
    ctx.src = src;
    ctx.play();
  }
  
  // ✅ 后台时暂停BGM
  onHide() {
    this._bgmContext.pause();
  }
  
  onShow() {
    this._bgmContext.play();
  }
}

// 音频文件优化:
// ✅ 使用mp3格式(微信环境最兼容)
// ✅ 音效文件 < 100KB/个
// ✅ BGM < 2MB (可适当压缩)
// ✅ 短音效用单声道
```

### 4.4 微信API优化

```typescript
// ❌ 坏: 频繁调用wx.getSystemInfoSync()
// 每次都发同步IPC调用，性能差

// ✅ 好: 启动时缓存
class DeviceInfo {
  static screenWidth: number;
  static screenHeight: number;
  static pixelRatio: number;
  static platform: string;
  
  static init() {
    const info = wx.getSystemInfoSync();
    this.screenWidth = info.screenWidth;
    this.screenHeight = info.screenHeight;
    this.pixelRatio = info.pixelRatio;
    this.platform = info.platform;
  }
}

// ✅ 好: 批量操作代替逐个操作
// 云数据库批量更新
db.collection('leaderboard').where({...}).update({
  data: { score: _.inc(10) }
});
// 不要逐个文档更新

// ✅ 好: 离线优先
// 优先使用本地数据，异步同步云端
```

---

## 五、动画优化

### 5.1 动画系统

```typescript
// ✅ 使用DragonBones/Spine代替帧动画
// 骨骼动画内存小，CPU开销低
// 帧动画每帧都占纹理内存

// ✅ 减少同时播放的动画数量
class AnimationManager {
  private _activeAnimations: Set<Animation> = new Set();
  private readonly MAX_ACTIVE = 20;
  
  play(anim: Animation, name: string) {
    if (this._activeAnimations.size >= this.MAX_ACTIVE) {
      // 暂停最远的动画
      const oldest = this._activeAnimations.values().next().value;
      oldest.pause();
      this._activeAnimations.delete(oldest);
    }
    anim.play(name);
    this._activeAnimations.add(anim);
  }
}

// ✅ 非关键动画降低帧率
// animation.frameRate = 15; // 默认30,非关键动画可用15
```

### 5.2 视口剔除

```typescript
// ✅ 屏幕外的节点不更新/不播放动画
class ViewportCuller {
  static isVisible(node: Node, camera: Camera): boolean {
    const worldPos = node.worldPosition;
    const screenPos = camera.worldToScreen(worldPos);
    return screenPos.x > -100 && screenPos.x < camera.width + 100 &&
           screenPos.y > -100 && screenPos.y < camera.height + 100;
  }
  
  // 在Update中调用
  updateNodes(nodes: Node[], camera: Camera) {
    for (const node of nodes) {
      const visible = ViewportCuller.isVisible(node, camera);
      if (node.active !== visible) {
        node.active = visible; // 不可见时整个节点停用
      }
    }
  }
}
```

---

## 六、UI优化

### 6.1 Canvas优化

```typescript
// ✅ UI Canvas与游戏Canvas分离
// 避免游戏对象移动时导致UI层重绘

// ✅ 静态UI使用RenderMode.CANVAS
// (Cocos Creator 3.x 默认使用Canvas渲染)

// ✅ 避免UI元素的频繁更新
// ❌ 坏: 每帧更新分数文本
update(dt: number) {
  this.scoreLabel.string = `${this.score}`;
}

// ✅ 好: 只在分数改变时更新
setScore(value: number) {
  if (this.score !== value) {
    this.score = value;
    this.scoreLabel.string = `${this.score}`;
  }
}
```

### 6.2 ScrollView优化

```typescript
// ✅ 使用虚拟列表(只渲染可见区域)
class VirtualList {
  private _itemHeight: number = 100;
  private _poolSize: number = 15; // 可见区域+2个缓冲区
  
  onScroll(event: EventScrollView) {
    const offset = event.scrollOffset.y;
    const startIndex = Math.floor(offset / this._itemHeight);
    
    // 只更新可见区域的item
    for (let i = 0; i < this._poolSize; i++) {
      const dataIndex = startIndex + i;
      const item = this._itemPool[i];
      item.position = new Vec3(0, -dataIndex * this._itemHeight, 0);
      this.updateItem(item, this._dataList[dataIndex]);
    }
  }
}

// ❌ 避免: ScrollView中实例化所有列表项(如100+个)
```

---

## 七、网络优化

### 7.1 请求优化

```typescript
// ✅ 合并请求
class RequestBatcher {
  private _pending: Map<string, any> = new Map();
  private _timer: number | null = null;
  
  batchRequest(key: string, data: any) {
    this._pending.set(key, data);
    if (!this._timer) {
      this._timer = setTimeout(() => this.flush(), 200);
    }
  }
  
  async flush() {
    const batch = Array.from(this._pending.entries());
    this._pending.clear();
    this._timer = null;
    
    // 一次网络请求发送所有数据
    await this.sendBatch(batch);
  }
}

// ✅ 指数退避重试
async function requestWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await delay(Math.pow(2, i) * 1000); // 1s, 2s, 4s
    }
  }
}
```

### 7.2 数据同步

```typescript
// ✅ 增量同步，避免全量
class SyncManager {
  private _lastSyncTime: number = 0;
  
  async syncToCloud() {
    const changes = this._getChangesSince(this._lastSyncTime);
    if (changes.length === 0) return;
    
    await this._uploadChanges(changes);
    this._lastSyncTime = Date.now();
  }
  
  // ✅ 非关键数据延迟同步
  scheduleSync() {
    // 每30秒同步一次(非实时)
    setInterval(() => this.syncToCloud(), 30000);
  }
}
```

---

## 八、性能监控

### 8.1 内置监控

```typescript
// ✅ 在开发阶段开启性能面板
export class PerformanceMonitor {
  private _fpsHistory: number[] = [];
  
  start() {
    // FPS统计
    let frameCount = 0;
    let lastTime = Date.now();
    
    setInterval(() => {
      const now = Date.now();
      const fps = Math.round(frameCount / ((now - lastTime) / 1000));
      this._fpsHistory.push(fps);
      frameCount = 0;
      lastTime = now;
      
      if (fps < 20) {
        console.warn(`[性能] 低帧率: ${fps} FPS`);
      }
    }, 1000);
    
    // 内存监控
    setInterval(() => {
      if (typeof wx !== 'undefined') {
        const perf = wx.getPerformance();
        const mem = (perf as any).memory;
        if (mem && mem.jsHeapSizeLimit) {
          const used = mem.usedJSHeapSize / 1024 / 1024;
          const total = mem.totalJSHeapSize / 1024 / 1024;
          console.log(`[内存] JS堆: ${used.toFixed(1)}/${total.toFixed(1)} MB`);
          
          if (used / total > 0.8) {
            console.warn('[内存] 内存使用率超过80%，触发GC');
            wx.triggerGC();
          }
        }
      }
    }, 10000);
  }
  
  getAverageFps(): number {
    if (this._fpsHistory.length === 0) return 0;
    return this._fpsHistory.reduce((a, b) => a + b, 0) / this._fpsHistory.length;
  }
}

// 微信小游戏性能面板(开发时)
// 在 game.json 中设置:
// "devOptions": { "showFps": true }
```

### 8.2 性能预算

| 指标 | 目标值 | 警戒值 | 严重值 |
|:---|:---:|:---:|:---:|
| FPS | ≥ 55 | 30~55 | < 30 |
| DrawCall | ≤ 30 | 30~60 | > 60 |
| 首屏加载 | ≤ 3s | 3~6s | > 6s |
| JS堆内存 | ≤ 60MB | 60~100MB | > 100MB |
| 纹理内存 | ≤ 50MB | 50~100MB | > 100MB |
| 包体积 | ≤ 3MB | 3~4MB | > 4MB |
| 崩溃率 | ≤ 0.1% | 0.1~0.5% | > 0.5% |

---

## 九、构建配置优化

### 9.1 Cocos Creator构建设置

```json
// buildConfig.json 推荐配置
{
  "platform": "wechatgame",
  "debug": false,
  "md5Cache": true,
  "inlineSpriteFrames": true,
  "mergeStartScene": true,
  "packAutoAtlas": true,
  "compressTexture": {
    "android": "etc2",
    "ios": "pvrtc"
  },
  "minifyJs": true,
  "sourceMaps": false
}
```

### 9.2 game.json 优化

```json
{
  "deviceOrientation": "portrait",
  "showStatusBar": false,
  "networkTimeout": {
    "request": 10000,
    "connectSocket": 10000,
    "uploadFile": 10000,
    "downloadFile": 10000
  },
  "workers": "workers",
  "subPackages": [
    {
      "name": "battle",
      "root": "subpackages/battle/"
    },
    {
      "name": "gacha",
      "root": "subpackages/gacha/"
    }
  ],
  "preloadRule": {
    "pages/main/index": {
      "packages": ["battle"]
    }
  }
}
```

---

## 十、优化优先级矩阵

| 优化项 | 难度 | 收益 | 优先级 |
|:---|:---:|:---:|:---:|
| 纹理压缩 | ⭐ | ⭐⭐⭐⭐⭐ | 🔴 P0 |
| 资源懒加载 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 🔴 P0 |
| 对象池 | ⭐⭐ | ⭐⭐⭐⭐ | 🔴 P0 |
| DrawCall优化(图集) | ⭐⭐ | ⭐⭐⭐⭐ | 🟡 P1 |
| 分包加载 | ⭐⭐ | ⭐⭐⭐⭐ | 🟡 P1 |
| UI Canvas分离 | ⭐ | ⭐⭐⭐ | 🟡 P1 |
| 动画帧率优化 | ⭐ | ⭐⭐⭐ | 🟡 P1 |
| 虚拟列表 | ⭐⭐⭐ | ⭐⭐⭐ | 🟢 P2 |
| 代码GC优化 | ⭐⭐⭐ | ⭐⭐ | 🟢 P2 |
| 视口剔除 | ⭐⭐ | ⭐⭐ | 🟢 P2 |
| 本地缓存策略 | ⭐⭐ | ⭐⭐ | 🟢 P2 |
| 网络请求合并 | ⭐⭐ | ⭐⭐ | 🟢 P2 |

---

**本优化清单应在以下时间节点执行:**
1. **开发阶段**: P0项持续遵守
2. **提测前**: P1项全部完成
3. **上线后迭代**: P2项逐步完善
4. **大版本更新**: 全量复检
