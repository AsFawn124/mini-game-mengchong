/**
 * 每日任务管理器
 * 管理日常任务和奖励
 */

import GameMain from '../GameMain';
import { EventManager } from '../utils/GameUtils';

const { ccclass } = cc._decorator;

export interface DailyTask {
    id: string;
    name: string;
    description: string;
    type: TaskType;
    target: number;
    current: number;
    reward: TaskReward;
    completed: boolean;
    claimed: boolean;
}

export type TaskType = 
    | 'login'           // 登录
    | 'battle'          // 战斗
    | 'win'             // 胜利
    | 'gacha'           // 抽卡
    | 'merge'           // 合成
    | 'levelup'         // 升级
    | 'share';          // 分享

export interface TaskReward {
    gold?: number;
    diamond?: number;
    exp?: number;
    item?: string;
}

@ccclass
export class DailyTaskManager extends cc.Component {
    
    private _tasks: DailyTask[] = [];
    private _lastResetTime: number = 0;
    
    // 任务配置
    private readonly _taskConfigs: Omit<DailyTask, 'current' | 'completed' | 'claimed'>[] = [
        {
            id: 'login',
            name: '每日登录',
            description: '登录游戏',
            type: 'login',
            target: 1,
            reward: { diamond: 50, exp: 100 }
        },
        {
            id: 'battle3',
            name: '战斗狂人',
            description: '完成3场战斗',
            type: 'battle',
            target: 3,
            reward: { gold: 2000, exp: 200 }
        },
        {
            id: 'win5',
            name: '常胜将军',
            description: '获得5场胜利',
            type: 'win',
            target: 5,
            reward: { diamond: 30, gold: 1000 }
        },
        {
            id: 'gacha1',
            name: '试试手气',
            description: '进行1次抽卡',
            type: 'gacha',
            target: 1,
            reward: { gold: 500, exp: 50 }
        },
        {
            id: 'gacha10',
            name: '十连召唤',
            description: '进行1次十连抽',
            type: 'gacha',
            target: 10,
            reward: { diamond: 100, exp: 300 }
        },
        {
            id: 'merge3',
            name: '合成大师',
            description: '成功合成3次',
            type: 'merge',
            target: 3,
            reward: { gold: 1500, exp: 150 }
        },
        {
            id: 'levelup2',
            name: '成长之路',
            description: '升级2只萌宠',
            type: 'levelup',
            target: 2,
            reward: { gold: 1000, exp: 100 }
        },
        {
            id: 'share1',
            name: '分享快乐',
            description: '分享游戏1次',
            type: 'share',
            target: 1,
            reward: { diamond: 20, exp: 50 }
        }
    ];
    
    onLoad() {
        console.log('[DailyTaskManager] 初始化');
        this._initTasks();
        this._bindEvents();
    }
    
    /**
     * 初始化任务
     */
    private _initTasks(): void {
        // 检查是否需要重置（新的一天）
        if (this._shouldReset()) {
            this._resetTasks();
        } else {
            // 加载保存的任务进度
            this._loadTasks();
        }
    }
    
    /**
     * 检查是否需要重置
     */
    private _shouldReset(): boolean {
        const lastReset = this._getLastResetTime();
        const now = Date.now();
        
        // 获取今天的5点时间（游戏日刷新时间）
        const today5am = new Date();
        today5am.setHours(5, 0, 0, 0);
        
        return lastReset < today5am.getTime();
    }
    
    /**
     * 重置任务
     */
    private _resetTasks(): void {
        this._tasks = this._taskConfigs.map(config => ({
            ...config,
            current: 0,
            completed: false,
            claimed: false
        }));
        
        this._lastResetTime = Date.now();
        this._saveTasks();
        
        console.log('[DailyTaskManager] 每日任务已重置');
    }
    
    /**
     * 绑定事件监听
     */
    private _bindEvents(): void {
        // 监听游戏事件，更新任务进度
        EventManager.instance.on('battle_complete', this._onBattleComplete, this);
        EventManager.instance.on('gacha_complete', this._onGachaComplete, this);
        EventManager.instance.on('merge_complete', this._onMergeComplete, this);
        EventManager.instance.on('levelup_complete', this._onLevelUpComplete, this);
        EventManager.instance.on('share_complete', this._onShareComplete, this);
    }
    
    /**
     * 更新任务进度
     */
    public updateProgress(type: TaskType, count: number = 1): void {
        let hasUpdate = false;
        
        this._tasks.forEach(task => {
            if (task.type === type && !task.completed) {
                task.current += count;
                
                // 检查是否完成
                if (task.current >= task.target) {
                    task.current = task.target;
                    task.completed = true;
                    
                    // 发送任务完成事件
                    cc.game.emit('task_completed', task);
                    
                    console.log(`[DailyTaskManager] 任务完成: ${task.name}`);
                }
                
                hasUpdate = true;
            }
        });
        
        if (hasUpdate) {
            this._saveTasks();
            cc.game.emit('task_update', this._tasks);
        }
    }
    
    /**
     * 领取任务奖励
     */
    public claimReward(taskId: string): boolean {
        const task = this._tasks.find(t => t.id === taskId);
        
        if (!task || !task.completed || task.claimed) {
            return false;
        }
        
        // 发放奖励
        this._giveReward(task.reward);
        
        task.claimed = true;
        this._saveTasks();
        
        console.log(`[DailyTaskManager] 领取奖励: ${task.name}`);
        
        cc.game.emit('task_reward_claimed', task);
        
        return true;
    }
    
    /**
     * 一键领取所有奖励
     */
    public claimAllRewards(): TaskReward {
        const totalReward: TaskReward = {};
        
        this._tasks.forEach(task => {
            if (task.completed && !task.claimed) {
                this._addReward(totalReward, task.reward);
                task.claimed = true;
            }
        });
        
        if (Object.keys(totalReward).length > 0) {
            this._giveReward(totalReward);
            this._saveTasks();
            
            console.log('[DailyTaskManager] 一键领取所有奖励');
        }
        
        return totalReward;
    }
    
    /**
     * 发放奖励
     */
    private _giveReward(reward: TaskReward): void {
        if (reward.gold) {
            // 增加金币
            console.log(`[DailyTaskManager] 获得金币: ${reward.gold}`);
        }
        
        if (reward.diamond) {
            // 增加钻石
            console.log(`[DailyTaskManager] 获得钻石: ${reward.diamond}`);
        }
        
        if (reward.exp) {
            // 增加经验
            console.log(`[DailyTaskManager] 获得经验: ${reward.exp}`);
        }
        
        if (reward.item) {
            // 获得道具
            console.log(`[DailyTaskManager] 获得道具: ${reward.item}`);
        }
    }
    
    /**
     * 累加奖励
     */
    private _addReward(total: TaskReward, add: TaskReward): void {
        if (add.gold) total.gold = (total.gold || 0) + add.gold;
        if (add.diamond) total.diamond = (total.diamond || 0) + add.diamond;
        if (add.exp) total.exp = (total.exp || 0) + add.exp;
    }
    
    /**
     * 获取所有任务
     */
    public getTasks(): DailyTask[] {
        return [...this._tasks];
    }
    
    /**
     * 获取已完成但未领取的任务数量
     */
    public getUnclaimedCount(): number {
        return this._tasks.filter(t => t.completed && !t.claimed).length;
    }
    
    /**
     * 获取任务完成进度
     */
    public getProgress(): { completed: number; total: number } {
        return {
            completed: this._tasks.filter(t => t.completed).length,
            total: this._tasks.length
        };
    }
    
    /**
     * 检查是否所有任务完成
     */
    public isAllCompleted(): boolean {
        return this._tasks.every(t => t.completed);
    }
    
    /**
     * 检查是否所有奖励已领取
     */
    public isAllClaimed(): boolean {
        return this._tasks.every(t => !t.completed || t.claimed);
    }
    
    // 事件处理
    private _onBattleComplete(data: { victory: boolean }): void {
        this.updateProgress('battle');
        if (data.victory) {
            this.updateProgress('win');
        }
    }
    
    private _onGachaComplete(data: { count: number }): void {
        this.updateProgress('gacha', data.count);
    }
    
    private _onMergeComplete(): void {
        this.updateProgress('merge');
    }
    
    private _onLevelUpComplete(): void {
        this.updateProgress('levelup');
    }
    
    private _onShareComplete(): void {
        this.updateProgress('share');
    }
    
    /**
     * 保存任务数据
     */
    private _saveTasks(): void {
        try {
            const data = {
                tasks: this._tasks,
                lastResetTime: this._lastResetTime
            };
            cc.sys.localStorage.setItem('daily_tasks', JSON.stringify(data));
        } catch (e) {
            console.error('[DailyTaskManager] 保存任务失败', e);
        }
    }
    
    /**
     * 加载任务数据
     */
    private _loadTasks(): void {
        try {
            const data = cc.sys.localStorage.getItem('daily_tasks');
            if (data) {
                const parsed = JSON.parse(data);
                this._tasks = parsed.tasks || [];
                this._lastResetTime = parsed.lastResetTime || 0;
            } else {
                this._resetTasks();
            }
        } catch (e) {
            console.error('[DailyTaskManager] 加载任务失败', e);
            this._resetTasks();
        }
    }
    
    /**
     * 获取上次重置时间
     */
    private _getLastResetTime(): number {
        try {
            const data = cc.sys.localStorage.getItem('daily_tasks');
            if (data) {
                return JSON.parse(data).lastResetTime || 0;
            }
        } catch (e) {
            console.error('[DailyTaskManager] 获取重置时间失败', e);
        }
        return 0;
    }
    
    /**
     * 手动重置（用于测试）
     */
    public forceReset(): void {
        this._resetTasks();
        console.log('[DailyTaskManager] 任务已手动重置');
    }
    
    onDestroy() {
        EventManager.instance.off('battle_complete', this._onBattleComplete, this);
        EventManager.instance.off('gacha_complete', this._onGachaComplete, this);
        EventManager.instance.off('merge_complete', this._onMergeComplete, this);
        EventManager.instance.off('levelup_complete', this._onLevelUpComplete, this);
        EventManager.instance.off('share_complete', this._onShareComplete, this);
    }
}
