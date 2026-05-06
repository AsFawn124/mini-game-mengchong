/**
 * 游戏工具类
 * 提供各种通用功能
 */

/**
 * 格式化数字（添加千分位）
 */
export function formatNumber(num: number): string {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    }
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
}

/**
 * 格式化时间
 */
export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 随机整数
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 随机选择数组元素
 */
export function randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * 打乱数组
 */
export function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime()) as unknown as T;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)) as unknown as T;
    }
    
    const cloned = {} as T;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    
    return cloned;
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;
    
    return function(...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: number | null = null;
    
    return function(...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * 本地存储封装
 */
export const Storage = {
    /**
     * 保存数据
     */
    set(key: string, value: any): void {
        try {
            const data = JSON.stringify(value);
            cc.sys.localStorage.setItem(key, data);
        } catch (e) {
            console.error('[Storage] 保存失败:', e);
        }
    },
    
    /**
     * 读取数据
     */
    get<T>(key: string, defaultValue: T = null): T {
        try {
            const data = cc.sys.localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('[Storage] 读取失败:', e);
            return defaultValue;
        }
    },
    
    /**
     * 删除数据
     */
    remove(key: string): void {
        try {
            cc.sys.localStorage.removeItem(key);
        } catch (e) {
            console.error('[Storage] 删除失败:', e);
        }
    },
    
    /**
     * 清空所有数据
     */
    clear(): void {
        try {
            cc.sys.localStorage.clear();
        } catch (e) {
            console.error('[Storage] 清空失败:', e);
        }
    }
};

/**
 * 事件管理器
 */
export class EventManager {
    private static _instance: EventManager = null;
    private _listeners: Map<string, Set<Function>> = new Map();
    
    public static get instance(): EventManager {
        if (!EventManager._instance) {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }
    
    /**
     * 监听事件
     */
    public on(event: string, callback: Function): void {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(callback);
    }
    
    /**
     * 取消监听
     */
    public off(event: string, callback: Function): void {
        const listeners = this._listeners.get(event);
        if (listeners) {
            listeners.delete(callback);
        }
    }
    
    /**
     * 触发事件
     */
    public emit(event: string, ...args: any[]): void {
        const listeners = this._listeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(...args);
                } catch (e) {
                    console.error('[EventManager] 事件处理错误:', e);
                }
            });
        }
    }
    
    /**
     * 移除所有监听
     */
    public removeAll(event?: string): void {
        if (event) {
            this._listeners.delete(event);
        } else {
            this._listeners.clear();
        }
    }
}

/**
 * 对象池管理器
 */
export class ObjectPool<T extends cc.Node> {
    private _prefab: cc.Prefab = null;
    private _pool: T[] = [];
    private _active: Set<T> = new Set();
    
    constructor(prefab: cc.Prefab, initialSize: number = 10) {
        this._prefab = prefab;
        
        // 预创建对象
        for (let i = 0; i < initialSize; i++) {
            const obj = cc.instantiate(this._prefab) as T;
            obj.active = false;
            this._pool.push(obj);
        }
    }
    
    /**
     * 获取对象
     */
    public get(): T {
        let obj: T;
        
        if (this._pool.length > 0) {
            obj = this._pool.pop();
        } else {
            obj = cc.instantiate(this._prefab) as T;
        }
        
        obj.active = true;
        this._active.add(obj);
        
        return obj;
    }
    
    /**
     * 回收对象
     */
    public recycle(obj: T): void {
        if (this._active.has(obj)) {
            this._active.delete(obj);
            obj.active = false;
            obj.parent = null;
            this._pool.push(obj);
        }
    }
    
    /**
     * 回收所有对象
     */
    public recycleAll(): void {
        this._active.forEach(obj => {
            obj.active = false;
            obj.parent = null;
            this._pool.push(obj);
        });
        this._active.clear();
    }
    
    /**
     * 清空池
     */
    public clear(): void {
        this._pool.forEach(obj => obj.destroy());
        this._pool = [];
        this._active.clear();
    }
    
    /**
     * 获取活跃对象数量
     */
    public get activeCount(): number {
        return this._active.size;
    }
    
    /**
     * 获取池中对象数量
     */
    public get poolCount(): number {
        return this._pool.length;
    }
}

/**
 * 屏幕适配工具
 */
export const ScreenAdapter = {
    /**
     * 获取设计分辨率
     */
    getDesignResolution(): cc.Size {
        return cc.view.getDesignResolutionSize();
    },
    
    /**
     * 获取实际屏幕分辨率
     */
    getScreenResolution(): cc.Size {
        return cc.view.getFrameSize();
    },
    
    /**
     * 适配节点到安全区域
     */
    adaptToSafeArea(node: cc.Node): void {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            const systemInfo = wx.getSystemInfoSync();
            const safeArea = systemInfo.safeArea;
            
            if (safeArea) {
                const screenHeight = systemInfo.screenHeight;
                const safeTop = safeArea.top;
                const safeBottom = screenHeight - safeArea.bottom;
                
                // 调整节点位置
                node.y -= safeTop;
            }
        }
    },
    
    /**
     * 计算适配缩放
     */
    getAdaptScale(): number {
        const designSize = this.getDesignResolution();
        const screenSize = this.getScreenResolution();
        
        return Math.min(
            screenSize.width / designSize.width,
            screenSize.height / designSize.height
        );
    }
};

/**
 * 资源加载器
 */
export class AssetLoader {
    private _cache: Map<string, any> = new Map();
    
    /**
     * 加载资源
     */
    public load<T>(path: string, type: typeof cc.Asset): Promise<T> {
        return new Promise((resolve, reject) => {
            // 检查缓存
            if (this._cache.has(path)) {
                resolve(this._cache.get(path));
                return;
            }
            
            // 加载资源
            cc.loader.loadRes(path, type, (err, asset) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                this._cache.set(path, asset);
                resolve(asset as T);
            });
        });
    }
    
    /**
     * 预加载资源
     */
    public preload(paths: string[], type: typeof cc.Asset): Promise<void> {
        return new Promise((resolve, reject) => {
            cc.loader.loadResArray(paths, type, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    
    /**
     * 释放资源
     */
    public release(path: string): void {
        if (this._cache.has(path)) {
            this._cache.delete(path);
            cc.loader.releaseRes(path);
        }
    }
    
    /**
     * 清空缓存
     */
    public clear(): void {
        this._cache.clear();
        cc.loader.releaseAll();
    }
}
