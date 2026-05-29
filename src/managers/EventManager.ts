/**
 * EventManager - 限时活动系统
 * 支持签到活动、节日活动、限时挑战、通行证活动
 */

import { GameConfig } from '../GameConfig';
import { PetEntity, PetRarity } from '../entities/PetEntity';

// 活动类型
export enum EventType {
    SIGN_IN = 'sign_in',                 // 签到活动
    HOLIDAY = 'holiday',                 // 节日活动
    LIMITED_CHALLENGE = 'challenge',     // 限时挑战
    DOUBLE_REWARDS = 'double_rewards',   // 双倍奖励
    COLLECTION = 'collection',           // 收集活动
    BOSS_RUSH = 'boss_rush',            // Boss突袭
    PUZZLE = 'puzzle',                  // 拼图活动
    LUCKY_DRAW = 'lucky_draw',          // 幸运转盘
}

// 活动状态
export enum EventStatus {
    UPCOMING = 'upcoming',  // 即将开启
    ACTIVE = 'active',      // 进行中
    ENDED = 'ended',        // 已结束
}

// 活动奖励
export interface EventReward {
    type: 'coins' | 'gems' | 'items' | 'pet' | 'ticket' | 'guild_coins';
    id?: string;           // 道具/萌宠ID
    name: string;
    amount: number;
    rarity?: string;
}

// 活动任务
export interface EventTask {
    id: string;
    name: string;
    description: string;
    target: number;         // 目标值
    progress: number;       // 当前进度
    rewards: EventReward[];
    completed: boolean;
    claimed: boolean;
}

// 活动定义
export interface GameEvent {
    id: string;
    name: string;
    description: string;
    type: EventType;
    status: EventStatus;
    bannerUrl: string;
    startTime: number;
    endTime: number;
    tasks: EventTask[];
    dailyRewards?: EventReward[][];  // 签到活动每日奖励
    milestones?: {                    // 里程碑奖励
        target: number;
        rewards: EventReward[];
        claimed: boolean;
    }[];
    exchangeItems?: {                  // 活动兑换
        id: string;
        name: string;
        cost: number;
        stock: number;
        maxExchange: number;
        exchanged: number;
        rewards: EventReward[];
    }[];
}

export class EventManager {
    private static instance: EventManager;

    private activeEvents: GameEvent[] = [];
    private completedEvents: string[] = [];
    private totalSignInDays: number = 0;
    private consecutiveSignInDays: number = 0;
    private lastSignInDate: string = '';

    // 预设活动模板
    private readonly EVENT_TEMPLATES: Record<string, Partial<GameEvent>> = {
        weekly_signin: {
            type: EventType.SIGN_IN,
            name: '每周签到',
            description: '每日签到领取丰厚奖励，连续签到奖励更优!',
            dailyRewards: [
                [{ type: 'coins', name: '金币', amount: 100 }],
                [{ type: 'coins', name: '金币', amount: 150 }],
                [{ type: 'gems', name: '钻石', amount: 5 }],
                [{ type: 'coins', name: '金币', amount: 200 }],
                [{ type: 'ticket', name: '普通抽卡券', amount: 1 }],
                [{ type: 'gems', name: '钻石', amount: 10 }],
                [{ type: 'ticket', name: '高级抽卡券', amount: 1 }],
            ]
        },
        double_exp_weekend: {
            type: EventType.DOUBLE_REWARDS,
            name: '周末双倍经验',
            description: '周五~周日，所有战斗获得双倍经验!',
            tasks: [
                { id: 'battle_5', name: '战斗达人', description: '完成5场战斗', target: 5, progress: 0, rewards: [{ type: 'coins', name: '金币', amount: 500 }], completed: false, claimed: false },
                { id: 'battle_15', name: '战斗精英', description: '完成15场战斗', target: 15, progress: 0, rewards: [{ type: 'ticket', name: '抽卡券', amount: 2 }], completed: false, claimed: false },
                { id: 'battle_30', name: '战斗王者', description: '完成30场战斗', target: 30, progress: 0, rewards: [{ type: 'gems', name: '钻石', amount: 50 }], completed: false, claimed: false },
            ]
        },
        boss_challenge: {
            type: EventType.BOSS_RUSH,
            name: 'Boss大挑战',
            description: '挑战世界Boss，根据伤害排名赢取丰厚奖励!',
            tasks: [
                { id: 'boss_1', name: '初露锋芒', description: '对Boss造成1000伤害', target: 1000, progress: 0, rewards: [{ type: 'coins', name: '金币', amount: 300 }], completed: false, claimed: false },
                { id: 'boss_2', name: '势不可挡', description: '对Boss造成5000伤害', target: 5000, progress: 0, rewards: [{ type: 'ticket', name: '高级抽卡券', amount: 2 }], completed: false, claimed: false },
                { id: 'boss_3', name: '毁天灭地', description: '对Boss造成20000伤害', target: 20000, progress: 0, rewards: [{ type: 'gems', name: '钻石', amount: 100 }], completed: false, claimed: false },
            ],
            milestones: [
                { target: 50, rewards: [{ type: 'items', name: 'Boss宝箱', amount: 1 }], claimed: false },
                { target: 200, rewards: [{ type: 'items', name: '史诗Boss宝箱', amount: 1 }], claimed: false },
                { target: 500, rewards: [{ type: 'pet', name: '限定SSR萌宠', amount: 1, rarity: 'SSR' }], claimed: false },
            ]
        },
        collection_event: {
            type: EventType.COLLECTION,
            name: '萌宠收集祭',
            description: '收集指定萌宠获得限定奖励! 集齐全部还有额外大奖!',
            tasks: [
                { id: 'collect_5', name: '初级收集家', description: '收集5种不同萌宠', target: 5, progress: 0, rewards: [{ type: 'coins', name: '金币', amount: 1000 }], completed: false, claimed: false },
                { id: 'collect_10', name: '中级收集家', description: '收集10种不同萌宠', target: 10, progress: 0, rewards: [{ type: 'ticket', name: '高级抽卡券', amount: 3 }], completed: false, claimed: false },
                { id: 'collect_20', name: '大收集家', description: '收集20种不同萌宠', target: 20, progress: 0, rewards: [{ type: 'gems', name: '钻石', amount: 200 }], completed: false, claimed: false },
                { id: 'collect_30', name: '完美收集家', description: '收集30种不同萌宠', target: 30, progress: 0, rewards: [{ type: 'pet', name: '限定UR萌宠', amount: 1, rarity: 'UR' }], completed: false, claimed: false },
            ]
        },
        lucky_spin: {
            type: EventType.LUCKY_DRAW,
            name: '幸运转盘',
            description: '消耗活动券转动转盘，赢取超值大奖! SSR萌宠等你来抽!',
            exchangeItems: [
                { id: 'spin_1', name: '1次转盘', cost: 1, stock: -1, maxExchange: 50, exchanged: 0, rewards: [] },
                { id: 'spin_5', name: '5次转盘87折', cost: 4, stock: -1, maxExchange: 10, exchanged: 0, rewards: [] },
                { id: 'spin_10', name: '10次转盘8折', cost: 8, stock: -1, maxExchange: 5, exchanged: 0, rewards: [] },
            ]
        }
    };

    // 奖励池（幸运转盘）
    private readonly LUCKY_DRAW_POOL: { reward: EventReward; weight: number }[] = [
        { reward: { type: 'coins', name: '金币x100', amount: 100 }, weight: 300 },
        { reward: { type: 'coins', name: '金币x500', amount: 500 }, weight: 200 },
        { reward: { type: 'gems', name: '钻石x10', amount: 10 }, weight: 150 },
        { reward: { type: 'gems', name: '钻石x50', amount: 50 }, weight: 80 },
        { reward: { type: 'ticket', name: '普通抽卡券', amount: 1 }, weight: 100 },
        { reward: { type: 'ticket', name: '高级抽卡券', amount: 1 }, weight: 60 },
        { reward: { type: 'items', name: '进化石', amount: 2 }, weight: 50 },
        { reward: { type: 'items', name: '经验药水x5', amount: 5 }, weight: 40 },
        { reward: { type: 'pet', name: 'SR萌宠随机', amount: 1, rarity: 'SR' }, weight: 15 },
        { reward: { type: 'pet', name: 'SSR萌宠随机', amount: 1, rarity: 'SSR' }, weight: 5 },
    ];

    private currentEventId: string = '';
    private eventSpinTickets: number = 0;

    private constructor() {
        this.loadLocalData();
        this.checkAndRefreshEvents();
    }

    public static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }

    // ==================== 活动管理 ====================

    /**
     * 检查并刷新活动列表
     */
    private checkAndRefreshEvents(): void {
        const now = Date.now();

        // 清理已结束活动
        this.activeEvents = this.activeEvents.filter(event => {
            if (event.endTime < now && event.status === EventStatus.ACTIVE) {
                event.status = EventStatus.ENDED;
                this.completedEvents.push(event.id);
                console.log(`[活动] 「${event.name}」已结束`);
            }
            return event.status !== EventStatus.ENDED;
        });

        // 激活即将开始的活动
        this.activeEvents.forEach(event => {
            if (event.startTime <= now && event.status === EventStatus.UPCOMING) {
                event.status = EventStatus.ACTIVE;
                console.log(`[活动] 「${event.name}」已开启!`);
            }
        });
    }

    /**
     * 创建限时活动
     */
    public createEvent(
        templateId: string,
        startTime: number,
        endTime: number,
        customName?: string
    ): GameEvent | null {
        const template = this.EVENT_TEMPLATES[templateId];
        if (!template) {
            console.warn(`[活动] 模板 ${templateId} 不存在`);
            return null;
        }

        const event: GameEvent = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: customName || template.name || '新活动',
            description: template.description || '',
            type: template.type || EventType.SIGN_IN,
            status: startTime > Date.now() ? EventStatus.UPCOMING : EventStatus.ACTIVE,
            bannerUrl: '',
            startTime,
            endTime,
            tasks: template.tasks ? JSON.parse(JSON.stringify(template.tasks)) : [],
            dailyRewards: template.dailyRewards ? JSON.parse(JSON.stringify(template.dailyRewards)) : undefined,
            milestones: template.milestones ? JSON.parse(JSON.stringify(template.milestones)) : undefined,
            exchangeItems: template.exchangeItems ? JSON.parse(JSON.stringify(template.exchangeItems)) : undefined,
        };

        this.activeEvents.push(event);
        this.saveLocalData();

        console.log(`[活动] 创建活动「${event.name}」成功! (${new Date(startTime).toLocaleDateString()} ~ ${new Date(endTime).toLocaleDateString()})`);
        return event;
    }

    /**
     * 快速创建每周签到活动
     */
    public createWeeklySignIn(): GameEvent {
        const now = new Date();
        // 下一个周一
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
        nextMonday.setHours(0, 0, 0, 0);

        const nextSunday = new Date(nextMonday);
        nextSunday.setDate(nextMonday.getDate() + 6);
        nextSunday.setHours(23, 59, 59, 999);

        return this.createEvent('weekly_signin', nextMonday.getTime(), nextSunday.getTime())!;
    }

    // ==================== 签到系统 ====================

    /**
     * 每日签到
     */
    public dailySignIn(): EventReward[] | null {
        const now = new Date();
        const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

        if (this.lastSignInDate === today) {
            console.warn('[签到] 今日已签到');
            return null;
        }

        // 检查连续签到
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;

        if (this.lastSignInDate === yesterdayStr) {
            this.consecutiveSignInDays++;
        } else {
            this.consecutiveSignInDays = 1;
        }

        this.totalSignInDays++;
        this.lastSignInDate = today;

        // 从签到活动中获取奖励
        const signInEvent = this.activeEvents.find(
            e => e.type === EventType.SIGN_IN && e.status === EventStatus.ACTIVE
        );

        let rewards: EventReward[] = [];

        if (signInEvent?.dailyRewards) {
            const dayIndex = (this.consecutiveSignInDays - 1) % signInEvent.dailyRewards.length;
            rewards = signInEvent.dailyRewards[dayIndex];
        } else {
            // 基础签到奖励
            const baseRewards: EventReward[] = [
                { type: 'coins', name: '金币', amount: 50 + this.consecutiveSignInDays * 10 }
            ];

            // 连续签到额外奖励
            if (this.consecutiveSignInDays >= 7) {
                baseRewards.push({ type: 'gems', name: '钻石', amount: 30 });
                baseRewards.push({ type: 'ticket', name: '高级抽卡券', amount: 1 });
            } else if (this.consecutiveSignInDays >= 3) {
                baseRewards.push({ type: 'gems', name: '钻石', amount: 5 });
            }

            rewards = baseRewards;
        }

        console.log(`[签到] 签到成功! 连续签到第${this.consecutiveSignInDays}天`);
        rewards.forEach(r => console.log(`  + ${r.name}x${r.amount}`));

        this.saveLocalData();
        return rewards;
    }

    // ==================== 任务系统 ====================

    /**
     * 更新活动任务进度
     */
    public updateTaskProgress(eventId: string, taskId: string, progress: number): void {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (!event || event.status !== EventStatus.ACTIVE) return;

        const task = event.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;

        task.progress = Math.min(task.progress + progress, task.target);
        if (task.progress >= task.target) {
            task.completed = true;
            console.log(`[活动] 任务「${task.name}」已完成!`);
        }

        this.saveLocalData();
    }

    /**
     * 领取任务奖励
     */
    public claimTaskReward(eventId: string, taskId: string): EventReward[] | null {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (!event || event.status !== EventStatus.ACTIVE) return null;

        const task = event.tasks.find(t => t.id === taskId);
        if (!task || !task.completed || task.claimed) {
            console.warn('[活动] 无法领取奖励');
            return null;
        }

        task.claimed = true;
        console.log(`[活动] 领取「${task.name}」奖励成功!`);
        this.saveLocalData();

        return task.rewards;
    }

    /**
     * 领取里程碑奖励
     */
    public claimMilestoneReward(eventId: string, milestoneIndex: number): EventReward[] | null {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (!event?.milestones) return null;

        const milestone = event.milestones[milestoneIndex];
        if (!milestone || milestone.claimed) return null;

        // 简单处理：假设总进度由调用者检查
        milestone.claimed = true;
        this.saveLocalData();

        return milestone.rewards;
    }

    // ==================== 幸运转盘 ====================

    /**
     * 幸运转盘抽奖
     */
    public spinLuckyDraw(): EventReward | null {
        const spinEvent = this.activeEvents.find(
            e => e.type === EventType.LUCKY_DRAW && e.status === EventStatus.ACTIVE
        );

        if (!spinEvent) {
            console.warn('[转盘] 当前没有幸运转盘活动');
            return null;
        }

        if (this.eventSpinTickets <= 0) {
            console.warn('[转盘] 活动券不足');
            return null;
        }

        this.eventSpinTickets--;

        // 加权随机
        const totalWeight = this.LUCKY_DRAW_POOL.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        let selectedReward: EventReward | null = null;
        for (const item of this.LUCKY_DRAW_POOL) {
            random -= item.weight;
            if (random <= 0) {
                selectedReward = item.reward;
                break;
            }
        }

        if (selectedReward) {
            console.log(`[转盘] 🎰 抽中 ${selectedReward.name}!`);
        }

        this.saveLocalData();
        return selectedReward;
    }

    /**
     * 十连抽
     */
    public spinLuckyDraw10(): EventReward[] {
        const results: EventReward[] = [];
        // 十连抽保底至少1个SR
        let hasGuarantee = false;

        for (let i = 0; i < 10; i++) {
            if (this.eventSpinTickets <= 0) break;

            let result = this.spinLuckyDraw();
            if (!result) continue;

            // 前9次没出SR/SSR，第10次保底
            if (i === 9 && !hasGuarantee) {
                const guaranteedRewards = this.LUCKY_DRAW_POOL.filter(r =>
                    r.reward.type === 'pet' && (r.reward.rarity === 'SR' || r.reward.rarity === 'SSR')
                );
                if (guaranteedRewards.length > 0) {
                    result = guaranteedRewards[Math.floor(Math.random() * guaranteedRewards.length)].reward;
                    console.log(`[转盘] 🎉 十连保底触发!`);
                }
            }

            if (result.rarity === 'SR' || result.rarity === 'SSR') {
                hasGuarantee = true;
            }
            results.push(result);
        }

        return results;
    }

    // ==================== 数据持久化 ====================

    private loadLocalData(): void {
        try {
            const data = JSON.parse(GameConfig.loadLocal('event_data') || '{}');
            if (data.activeEvents) this.activeEvents = data.activeEvents;
            if (data.totalSignInDays) this.totalSignInDays = data.totalSignInDays;
            if (data.consecutiveSignInDays) this.consecutiveSignInDays = data.consecutiveSignInDays;
            if (data.lastSignInDate) this.lastSignInDate = data.lastSignInDate;
            if (data.eventSpinTickets) this.eventSpinTickets = data.eventSpinTickets;
        } catch (e) {
            console.warn('[活动] 加载本地数据失败');
        }
    }

    private saveLocalData(): void {
        const data = {
            activeEvents: this.activeEvents,
            totalSignInDays: this.totalSignInDays,
            consecutiveSignInDays: this.consecutiveSignInDays,
            lastSignInDate: this.lastSignInDate,
            eventSpinTickets: this.eventSpinTickets
        };
        GameConfig.saveLocal('event_data', JSON.stringify(data));
    }

    // ==================== 每日重置 ====================

    public dailyReset(): void {
        this.checkAndRefreshEvents();
        this.saveLocalData();
    }

    // ==================== Getter ====================

    public getActiveEvents(): GameEvent[] {
        this.checkAndRefreshEvents();
        return this.activeEvents.filter(e => e.status === EventStatus.ACTIVE);
    }

    public getUpcomingEvents(): GameEvent[] {
        return this.activeEvents.filter(e => e.status === EventStatus.UPCOMING);
    }

    public getSignInInfo(): { totalDays: number; consecutiveDays: number; todaySigned: boolean } {
        const now = new Date();
        const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        return {
            totalDays: this.totalSignInDays,
            consecutiveDays: this.consecutiveSignInDays,
            todaySigned: this.lastSignInDate === today
        };
    }

    public getEventSpinTickets(): number { return this.eventSpinTickets; }

    public addSpinTickets(amount: number): void {
        this.eventSpinTickets += amount;
        this.saveLocalData();
    }
}
