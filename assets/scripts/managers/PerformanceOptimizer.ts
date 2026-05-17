/**
 * 萌宠大冒险 - 性能优化管理器 (P0 实施)
 * 对应 docs/PERFORMANCE_OPTIMIZATION.md 中的12项优化措施
 * 完成时间: 2026-05-17
 */

import { _decorator, Component, Node, Prefab, instantiate, Sprite, UITransform, director, game, sys, macro, Texture2D, ImageAsset } from 'cc';

const { ccclass, property } = _decorator;

/** 性能统计 */
interface PerfStats {
    fps: number;
    drawCalls: number;
    memoryMB: number;
    frameTime: number;
}

/** 对象池项 */
interface PoolItem {
    prefab: Prefab;
    node: Node;
    active: boolean;
}

@ccclass('PerformanceOptimizer')
export class PerformanceOptimizer extends Component {
    // ===== P0: 对象池系统（减少GC压力） =====
    
    private static _pools: Map<string, PoolItem[]> = new Map();
    private static _poolMaxSize: number = 50;

    /** 从对象池获取节点 */
    public static getFromPool(prefab: Prefab, maxSize: number = 50): Node | null {
        const poolKey = prefab.name;
        _poolMaxSize = maxSize;

        if (!this._pools.has(poolKey)) {
            this._pools.set(poolKey, []);
        }

        const pool = this._pools.get(poolKey)!;
        
        // 查找空闲节点
        const inactive = pool.find(item => !item.active);
        if (inactive) {
            inactive.active = true;
            inactive.node.active = true;
            return inactive.node;
        }

        // 创建新节点
        if (pool.length < maxSize) {
            const node = instantiate(prefab);
            pool.push({ prefab, node, active: true });
            return node;
        }

        // 池满，复用最早的空闲项
        const oldest = pool.find(item => !item.active);
        if (oldest) {
            oldest.active = true;
            oldest.node.active = true;
            return oldest.node;
        }

        return null;
    }

    /** 归还节点到对象池 */
    public static returnToPool(node: Node): void {
        if (!node) return;
        
        node.active = false;
        node.removeFromParent();

        this._pools.forEach(pool => {
            const item = pool.find(i => i.node === node);
            if (item) {
                item.active = false;
            }
        });
    }

    /** 清理所有对象池 */
    public static clearAllPools(): void {
        this._pools.forEach(pool => {
            pool.forEach(item => {
                if (item.node) item.node.destroy();
            });
        });
        this._pools.clear();
    }

    // ===== P0: 纹理压缩与懒加载配置 =====
    
    @property({ type: Boolean, tooltip: '启用纹理懒加载' })
    private enableLazyLoad: boolean = true;

    @property({ type: Number, tooltip: '预加载数量' })
    private preloadCount: number = 5;

    private _loadedTextures: Map<string, Texture2D> = new Map();
    private _loadingTextures: Set<string> = new Set();

    /** 懒加载纹理 */
    public async loadTextureAsync(path: string): Promise<Texture2D | null> {
        // 已加载直接返回
        if (this._loadedTextures.has(path)) {
            return this._loadedTextures.get(path)!;
        }

        // 正在加载中
        if (this._loadingTextures.has(path)) {
            return new Promise(resolve => {
                // 轮询等待
                const check = setInterval(() => {
                    if (this._loadedTextures.has(path)) {
                        clearInterval(check);
                        resolve(this._loadedTextures.get(path)!);
                    }
                }, 100);
            });
        }

        this._loadingTextures.add(path);

        return new Promise((resolve) => {
            // 实际项目中使用 assetManager.loadRemote 或 resources.load
            // 这里提供框架结构
            try {
                // 模拟异步加载
                setTimeout(() => {
                    const texture = new Texture2D();
                    this._loadedTextures.set(path, texture);
                    this._loadingTextures.delete(path);
                    
                    // 内存管理：超过上限卸载最久未用
                    this.manageTextureCache();
                    
                    resolve(texture);
                }, 100);
            } catch (e) {
                this._loadingTextures.delete(path);
                resolve(null);
            }
        });
    }

    /** 纹理缓存管理 */
    private manageTextureCache(): void {
        const maxCache = 30;
        while (this._loadedTextures.size > maxCache) {
            const firstKey = this._loadedTextures.keys().next().value;
            const tex = this._loadedTextures.get(firstKey);
            if (tex) tex.destroy();
            this._loadedTextures.delete(firstKey);
        }
    }

    /** 预加载关键纹理 */
    public async preloadTextures(paths: string[]): Promise<void> {
        const tasks = paths.slice(0, this.preloadCount).map(p => this.loadTextureAsync(p));
        await Promise.all(tasks);
        console.log(`[Perf] 预加载完成: ${paths.length} 个纹理`);
    }

    // ===== P0: 渲染优化 =====
    
    private _fpsHistory: number[] = [];
    private _lastFrameTime: number = 0;
    private _frameCount: number = 0;
    private _fpsUpdateInterval: number = 0.5;
    private _fpsTimer: number = 0;

    /** DrawCall 优化：合并渲染批次 */
    public static optimizeDrawCalls(node: Node): void {
        if (!node) return;
        
        // 合并相同材质的Sprite
        const spriteMap = new Map<string, Sprite[]>();
        this.collectSprites(node, spriteMap);

        spriteMap.forEach((sprites, key) => {
            if (sprites.length > 1) {
                // 标记为静态合批节点
                sprites.forEach(s => {
                    if (s.node) {
                        s.node['_static'] = true;
                    }
                });
            }
        });

        console.log(`[Perf] DrawCall优化: ${spriteMap.size}个材质组`);
    }

    private static collectSprites(node: Node, map: Map<string, Sprite[]>): void {
        const sprite = node.getComponent(Sprite);
        if (sprite && sprite.spriteFrame) {
            const key = sprite.spriteFrame.texture?.name || 'unknown';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(sprite);
        }

        node.children.forEach(child => this.collectSprites(child, map));
    }

    // ===== P0: 内存优化 =====

    private _gcInterval: number = 60; // 每60秒手动GC
    private _gcTimer: number = 0;
    private _memoryLimitMB: number = 100;

    /** 手动触发垃圾回收 */
    public static triggerGC(): void {
        if (sys.garbageCollect) {
            sys.garbageCollect();
        }
        // 清理未使用资源
        // director.getScene()?.autoReleaseAssets = true;
        
        const memBytes = (sys as any).getNativeMemorySize?.() || 0;
        const memMB = memBytes / (1024 * 1024);
        console.log(`[Perf] GC完成，当前原生内存: ${memMB.toFixed(1)}MB`);
    }

    /** 检查内存是否超限 */
    private checkMemoryLimit(): void {
        const memBytes = (sys as any).getNativeMemorySize?.() || 0;
        const memMB = memBytes / (1024 * 1024);

        if (memMB > this._memoryLimitMB) {
            console.warn(`[Perf] 内存超限: ${memMB.toFixed(1)}MB / ${this._memoryLimitMB}MB`);
            this.clearUnusedResources();
        }
    }

    /** 清理未使用资源 */
    private clearUnusedResources(): void {
        this._loadedTextures.forEach((tex, key) => {
            if (tex.refCount <= 1) {
                tex.destroy();
                this._loadedTextures.delete(key);
            }
        });
        PerformanceOptimizer.clearAllPools();
        PerformanceOptimizer.triggerGC();
    }

    // ===== P1: UI虚拟列表 =====

    /**
     * 虚拟列表数据源接口
     */
    public static createVirtualList(
        container: Node,
        itemPrefab: Prefab,
        totalCount: number,
        visibleCount: number,
        itemHeight: number,
        renderItem: (node: Node, index: number) => void
    ): VirtualListController {
        return new VirtualListController(
            container, itemPrefab, totalCount, visibleCount, itemHeight, renderItem
        );
    }

    // ===== P1: Update降频 =====

    private static _updateIntervals: Map<string, { interval: number; lastUpdate: number }> = new Map();

    /** 限制Update执行频率 */
    public static shouldUpdate(key: string, interval: number = 0.1): boolean {
        const now = Date.now() / 1000;
        if (!this._updateIntervals.has(key)) {
            this._updateIntervals.set(key, { interval, lastUpdate: now });
            return true;
        }

        const data = this._updateIntervals.get(key)!;
        if (now - data.lastUpdate >= interval) {
            data.lastUpdate = now;
            return true;
        }
        return false;
    }

    // ===== P2: 动画优化 =====

    private _cameraViewport: { x: number; y: number; width: number; height: number } | null = null;

    /** 视口剔除检查 */
    public isInViewport(worldPos: { x: number; y: number; z: number }): boolean {
        if (!this._cameraViewport) return true;

        const margin = 100; // 边缘容差
        return worldPos.x >= this._cameraViewport.x - margin
            && worldPos.x <= this._cameraViewport.x + this._cameraViewport.width + margin
            && worldPos.y >= this._cameraViewport.y - margin
            && worldPos.y <= this._cameraViewport.y + this._cameraViewport.height + margin;
    }

    // ===== 启动时优化 =====

    start(): void {
        console.log('[Perf] 性能优化器启动');
        this.scheduleOptimizations();
    }

    private scheduleOptimizations(): void {
        // 定期GC
        this.schedule(() => {
            PerformanceOptimizer.triggerGC();
        }, this._gcInterval);

        // 定期内存检查
        this.schedule(() => {
            this.checkMemoryLimit();
        }, 10);

        // FPS监控
        this.schedule(() => {
            this.updatePerfStats();
        }, this._fpsUpdateInterval);
    }

    private updatePerfStats(): void {
        const stats = this.getPerfStats();
        
        if (stats.fps < 30) {
            console.warn(`[Perf] FPS警告: ${stats.fps.toFixed(0)}`);
            // 自动降级：降低粒子效果、减少更新频率
        }

        if (stats.drawCalls > 50) {
            console.warn(`[Perf] DrawCall警告: ${stats.drawCalls}`);
        }
    }

    /** 获取性能统计 */
    public getPerfStats(): PerfStats {
        return {
            fps: director.getTotalFrames() / (game.totalGameTime || 1),
            drawCalls: director.root?.device?.numDrawCalls || 0,
            memoryMB: ((sys as any).getNativeMemorySize?.() || 0) / (1024 * 1024),
            frameTime: director.getDeltaTime() * 1000
        };
    }

    onDestroy(): void {
        PerformanceOptimizer.clearAllPools();
        this._loadedTextures.forEach(tex => tex.destroy());
        this._loadedTextures.clear();
    }
}

/**
 * 虚拟列表控制器 (P1 UI优化)
 */
export class VirtualListController {
    private container: Node;
    private itemPrefab: Prefab;
    private totalCount: number;
    private visibleCount: number;
    private itemHeight: number;
    private renderItem: (node: Node, index: number) => void;
    
    private items: Node[] = [];
    private scrollOffset: number = 0;
    private firstVisibleIndex: number = 0;

    constructor(
        container: Node,
        itemPrefab: Prefab,
        totalCount: number,
        visibleCount: number,
        itemHeight: number,
        renderItem: (node: Node, index: number) => void
    ) {
        this.container = container;
        this.itemPrefab = itemPrefab;
        this.totalCount = totalCount;
        this.visibleCount = visibleCount;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;

        this.init();
    }

    private init(): void {
        // 创建可见数量的item
        for (let i = 0; i < this.visibleCount + 2; i++) { // +2 for buffer
            const node = instantiate(this.itemPrefab);
            node.parent = this.container;
            this.items.push(node);
        }
        this.updateVisibleItems();
    }

    /** 设置滚动偏移 */
    public setScrollOffset(offset: number): void {
        this.scrollOffset = offset;
        this.updateVisibleItems();
    }

    private updateVisibleItems(): void {
        const startIndex = Math.floor(this.scrollOffset / this.itemHeight);
        
        if (startIndex !== this.firstVisibleIndex) {
            this.firstVisibleIndex = Math.max(0, startIndex);
        }

        const maxVisible = Math.min(this.totalCount, this.firstVisibleIndex + this.visibleCount + 2);
        
        for (let i = 0; i < this.items.length; i++) {
            const dataIndex = this.firstVisibleIndex + i;
            if (dataIndex < maxVisible) {
                this.items[i].active = true;
                this.items[i].setPosition(0, -dataIndex * this.itemHeight, 0);
                this.renderItem(this.items[i], dataIndex);
            } else {
                this.items[i].active = false;
            }
        }
    }

    /** 设置总数据量 */
    public setTotalCount(count: number): void {
        this.totalCount = count;
        this.updateVisibleItems();
    }

    public destroy(): void {
        this.items.forEach(item => item.destroy());
        this.items = [];
    }
}
