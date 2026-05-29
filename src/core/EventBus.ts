/**
 * EventBus - 全局事件总线 (TypeScript)
 * 解耦模块通信，支持优先级、一次性、延迟触发
 */
export class EventBus {
    private static instance: EventBus;

    private listeners: Map<string, ListenerEntry[]> = new Map();
    private pendingEvents: Map<string, (() => void)[]> = new Map();
    private isDispatching: boolean = false;

    public static getInstance(): EventBus {
        if (!this.instance) this.instance = new EventBus();
        return this.instance;
    }

    // ==================== 注册 ====================

    public on(eventName: string, callback: (data?: any) => void, priority: number = 0): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        this.listeners.get(eventName)!.push({
            callback,
            priority,
            once: false
        });

        // 按优先级排序
        this.listeners.get(eventName)!.sort((a, b) => b.priority - a.priority);
    }

    public once(eventName: string, callback: (data?: any) => void, priority: number = 0): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        this.listeners.get(eventName)!.push({
            callback,
            priority,
            once: true
        });
    }

    // ==================== 触发 ====================

    public emit(eventName: string, data?: any): void {
        const handlers = this.listeners.get(eventName);
        if (!handlers || handlers.length === 0) return;

        if (this.isDispatching) {
            // 延迟触发（避免循环）
            if (!this.pendingEvents.has(eventName)) {
                this.pendingEvents.set(eventName, []);
            }
            const snapshot = [...handlers];
            this.pendingEvents.get(eventName)!.push(() => this.dispatch(snapshot, eventName, data));
            return;
        }

        this.dispatch([...handlers], eventName, data);
    }

    public emitNextFrame(eventName: string, data?: any): void {
        if (!this.pendingEvents.has(eventName)) {
            this.pendingEvents.set(eventName, []);
        }
        this.pendingEvents.get(eventName)!.push(() => this.emit(eventName, data));
        this.flushPendingMicro();
    }

    private dispatch(handlers: ListenerEntry[], eventName: string, data?: any): void {
        this.isDispatching = true;
        const toRemove: ListenerEntry[] = [];

        for (const handler of handlers) {
            try {
                handler.callback(data);
                if (handler.once) toRemove.push(handler);
            } catch (e) {
                console.error(`[EventBus] Error in '${eventName}':`, e);
            }
        }

        // 清理一次性
        const list = this.listeners.get(eventName);
        if (list) {
            for (const h of toRemove) {
                const idx = list.indexOf(h);
                if (idx >= 0) list.splice(idx, 1);
            }
        }

        this.isDispatching = false;
    }

    // 微任务清空延迟队列
    private flushPendingMicro(): void {
        Promise.resolve().then(() => this.flushPending());
    }

    private flushPending(): void {
        if (this.isDispatching) return;

        const snapshot = new Map(this.pendingEvents);
        this.pendingEvents.clear();

        for (const [, callbacks] of snapshot) {
            for (const cb of callbacks) {
                try { cb(); } catch (e) { console.error('[EventBus] Pending error:', e); }
            }
        }
    }

    // ==================== 注销 ====================

    public off(eventName: string, callback?: (data?: any) => void): void {
        if (!this.listeners.has(eventName)) return;

        if (!callback) {
            this.listeners.delete(eventName);
        } else {
            const list = this.listeners.get(eventName)!;
            const idx = list.findIndex(h => h.callback === callback);
            if (idx >= 0) list.splice(idx, 1);
        }
    }

    // ==================== 调试 ====================

    public debugDump(): void {
        console.log('=== EventBus Listeners ===');
        this.listeners.forEach((handlers, name) => {
            console.log(`  [${name}] → ${handlers.length} handlers`);
        });
    }

    public hasListener(eventName: string): boolean {
        return this.listeners.has(eventName) && this.listeners.get(eventName)!.length > 0;
    }

    public clear(): void {
        this.listeners.clear();
        this.pendingEvents.clear();
    }
}

interface ListenerEntry {
    callback: (data?: any) => void;
    priority: number;
    once: boolean;
}
