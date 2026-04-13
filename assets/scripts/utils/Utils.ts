import { _decorator, Component, Node, Label, Button, Sprite, Color } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 工具类
 * 提供各种通用工具函数
 */
export class Utils {
    
    /**
     * 格式化数字（添加千分位）
     */
    static formatNumber(num: number): string {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * 格式化时间（秒转时分秒）
     */
    static formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * 随机整数 [min, max]
     */
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * 随机数组元素
     */
    static randomArrayElement<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    /**
     * 打乱数组
     */
    static shuffleArray<T>(arr: T[]): T[] {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    
    /**
     * 深拷贝对象
     */
    static deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }
    
    /**
     * 截断字符串
     */
    static truncateString(str: string, maxLength: number): string {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }
    
    /**
     * 延迟执行
     */
    static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 节流函数
     */
    static throttle<T extends (...args: any[]) => void>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle = false;
        return function(this: any, ...args: Parameters<T>) {
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
    static debounce<T extends (...args: any[]) => void>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: any;
        return function(this: any, ...args: Parameters<T>) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    /**
     * 本地存储封装
     */
    static storage = {
        set(key: string, value: any): void {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('Storage set error:', e);
            }
        },
        
        get(key: string, defaultValue: any = null): any {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get error:', e);
                return defaultValue;
            }
        },
        
        remove(key: string): void {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('Storage remove error:', e);
            }
        },
        
        clear(): void {
            try {
                localStorage.clear();
            } catch (e) {
                console.error('Storage clear error:', e);
            }
        }
    };
    
    /**
     * 颜色转换
     */
    static hexToColor(hex: string): Color {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return new Color(r, g, b);
    }
    
    /**
     * 计算两点距离
     */
    static distance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    /**
     * 线性插值
     */
    static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }
    
    /**
     * 平滑阻尼
     */
    static smoothDamp(
        current: number,
        target: number,
        currentVelocity: number,
        smoothTime: number,
        maxSpeed: number = Infinity,
        deltaTime: number
    ): { value: number, velocity: number } {
        smoothTime = Math.max(0.0001, smoothTime);
        const omega = 2 / smoothTime;
        const x = omega * deltaTime;
        const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        
        let change = current - target;
        const maxChange = maxSpeed * smoothTime;
        change = Math.max(-maxChange, Math.min(change, maxChange));
        
        const temp = (currentVelocity + omega * change) * deltaTime;
        let velocity = (currentVelocity - omega * temp) * exp;
        let value = target + (change + temp) * exp;
        
        if (target - current > 0 === value > target) {
            value = target;
            velocity = (value - target) / deltaTime;
        }
        
        return { value, velocity };
    }
}