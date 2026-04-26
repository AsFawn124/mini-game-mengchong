import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

/**
 * 每日任务
 */
export interface DailyTask {
    id: string;
    name: string;
    description: string;
    type: 'battle' | 'gacha' | 'social' | 'login';
    requirement: number;
    reward: { type: string, amount: number };
    progress: number;
    isCompleted: boolean;
    isClaimed: boolean;
}

/**
 * 每日任务管理器
 */
@ccclass('DailyTaskManager')
export class DailyTaskManager extends Component {
    
    // 单例
    private static _instance: DailyTaskManager = null;
    public static get instance(): DailyTaskManager {
        return DailyTaskManager._instance;
    }
    
    // 今日任务
    private tasks: DailyTask[] = [];
    
    // 最后刷新时间
    private lastRefreshTime: number = 0;
    
    onLoad() {
        if (DailyTaskManager._instance === null) {
            DailyTaskManager._instance = this;
        }
        this.checkAndRefresh();
    }
    
    /**
     * 检查并刷新任务
     */
    checkAndRefresh(): void {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        if (this.lastRefreshTime < today) {
            this.refreshTasks();
            this.lastRefreshTime = now.getTime();
            this.saveData();
        } else {
            this.loadData();
        }
    }
    
    /**
     * 刷新每日任务
     */
    private refreshTasks(): void {
        const taskPool: Omit<DailyTask, 'progress' | 'isCompleted' | 'isClaimed'>[] = [
            { id: 'task_battle_1', name: '战斗新手', description: '完成3场战斗', type: 'battle', requirement: 3, reward: { type: 'gold', amount: 200 } },
            { id: 'task_battle_2', name: '战斗达人', description: '通过第20波', type: 'battle', requirement: 20, reward: { type: 'gold', amount: 500 } },
            { id: 'task_battle_3', name: '挑战极限', description: '通过第50波', type: 'battle', requirement: 50, reward: { type: 'diamond', amount: 30 } },
            { id: 'task_gacha_1', name: '试试手气', description: '进行5次抽卡', type: 'gacha', requirement: 5, reward: { type: 'gold', amount: 300 } },
            { id: 'task_gacha_2', name: '抽卡达人', description: '获得1只SR以上萌宠', type: 'gacha', requirement: 1, reward: { type: 'diamond', amount: 50 } },
            { id: 'task_social_1', name: '好友互助', description: '向好友赠送体力3次', type: 'social', requirement: 3, reward: { type: 'energy', amount: 10 } },
            { id: 'task_social_2', name: '分享快乐', description: '分享游戏1次', type: 'social', requirement: 1, reward: { type: 'diamond', amount: 20 } },
            { id: 'task_login', name: '每日登录', description: '登录游戏', type: 'login', requirement: 1, reward: { type: 'diamond', amount: 10 } },
        ];
        
        // 随机选择5个任务
        const shuffled = taskPool.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        
        this.tasks = selected.map(t => ({
            ...t,
            progress: 0,
            isCompleted: false,
            isClaimed: false
        }));
        
        // 自动完成登录任务
        const loginTask = this.tasks.find(t => t.type === 'login');
        if (loginTask) {
            this.completeTask(loginTask.id);
        }
    }
    
    /**
     * 更新任务进度
     */
    updateProgress(taskType: string, amount: number = 1): void {
        this.tasks.forEach(task => {
            if (task.type === taskType && !task.isCompleted) {
                task.progress += amount;
                if (task.progress >= task.requirement) {
                    this.completeTask(task.id);
                }
            }
        });
        this.saveData();
    }
    
    /**
     * 完成任务
     */
    private completeTask(taskId: string): void {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || task.isCompleted) return;
        
        task.isCompleted = true;
        task.progress = task.requirement;
        
        console.log(`每日任务完成: ${task.name}`);
    }
    
    /**
     * 领取任务奖励
     */
    claimReward(taskId: string): boolean {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.isCompleted || task.isClaimed) {
            return false;
        }
        
        task.isClaimed = true;
        this.grantReward(task.reward);
        this.saveData();
        
        return true;
    }
    
    /**
     * 一键领取所有奖励
     */
    claimAllRewards(): { type: string, amount: number }[] {
        const rewards: { type: string, amount: number }[] = [];
        
        this.tasks.forEach(task => {
            if (task.isCompleted && !task.isClaimed) {
                task.isClaimed = true;
                rewards.push(task.reward);
            }
        });
        
        // 合并相同类型的奖励
        const merged: { [key: string]: number } = {};
        rewards.forEach(r => {
            merged[r.type] = (merged[r.type] || 0) + r.amount;
        });
        
        const result = Object.entries(merged).map(([type, amount]) => ({ type, amount }));
        
        result.forEach(r => this.grantReward(r));
        this.saveData();
        
        return result;
    }
    
    /**
     * 发放奖励
     */
    private grantReward(reward: { type: string, amount: number }): void {
        console.log(`发放任务奖励: ${reward.type} x${reward.amount}`);
        // TODO: 实际发放到玩家账户
    }
    
    /**
     * 获取所有任务
     */
    getAllTasks(): DailyTask[] {
        return this.tasks;
    }
    
    /**
     * 获取已完成但未领取的任务
     */
    getClaimableTasks(): DailyTask[] {
        return this.tasks.filter(t => t.isCompleted && !t.isClaimed);
    }
    
    /**
     * 获取完成进度
     */
    getProgress(): { completed: number, total: number } {
        const completed = this.tasks.filter(t => t.isCompleted).length;
        return { completed, total: this.tasks.length };
    }
    
    /**
     * 检查是否全部完成
     */
    isAllCompleted(): boolean {
        return this.tasks.every(t => t.isCompleted);
    }
    
    /**
     * 获取剩余刷新时间
     */
    getTimeUntilRefresh(): number {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return tomorrow.getTime() - now.getTime();
    }
    
    /**
     * 保存数据
     */
    private saveData(): void {
        const data = {
            tasks: this.tasks,
            lastRefreshTime: this.lastRefreshTime
        };
        localStorage.setItem('dailyTasks', JSON.stringify(data));
    }
    
    /**
     * 加载数据
     */
    private loadData(): void {
        const saved = localStorage.getItem('dailyTasks');
        if (!saved) {
            this.refreshTasks();
            return;
        }
        
        try {
            const data = JSON.parse(saved);
            this.tasks = data.tasks || [];
            this.lastRefreshTime = data.lastRefreshTime || 0;
        } catch (e) {
            this.refreshTasks();
        }
    }
}