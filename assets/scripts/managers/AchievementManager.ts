import { _decorator, Component, EventTarget } from 'cc';

const { ccclass } = _decorator;

// 成就事件
export const AchievementEvent = new EventTarget();

/**
 * 成就数据
 */
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: 'battle' | 'collection' | 'social' | 'special';
    requirement: number;
    reward: { type: string, amount: number };
    isCompleted: boolean;
    progress: number;
}

/**
 * 成就管理器
 * 管理游戏成就系统
 */
@ccclass('AchievementManager')
export class AchievementManager extends Component {
    
    // 单例
    private static _instance: AchievementManager = null;
    public static get instance(): AchievementManager {
        return AchievementManager._instance;
    }
    
    // 成就列表
    private achievements: Map<string, Achievement> = new Map();
    
    // 已完成的成就
    private completedAchievements: string[] = [];
    
    onLoad() {
        if (AchievementManager._instance === null) {
            AchievementManager._instance = this;
        }
        this.initAchievements();
        this.loadData();
    }
    
    /**
     * 初始化成就
     */
    private initAchievements(): void {
        const achievementList: Achievement[] = [
            // 战斗成就
            { id: 'battle_1', name: '初次胜利', description: '通过第10波', icon: 'icon_battle', type: 'battle', requirement: 10, reward: { type: 'gold', amount: 100 }, isCompleted: false, progress: 0 },
            { id: 'battle_2', name: '战斗新手', description: '通过第50波', icon: 'icon_battle', type: 'battle', requirement: 50, reward: { type: 'gold', amount: 500 }, isCompleted: false, progress: 0 },
            { id: 'battle_3', name: '战斗大师', description: '通过第100波', icon: 'icon_battle', type: 'battle', requirement: 100, reward: { type: 'diamond', amount: 100 }, isCompleted: false, progress: 0 },
            { id: 'battle_4', name: '无尽挑战者', description: '通过第500波', icon: 'icon_battle', type: 'battle', requirement: 500, reward: { type: 'diamond', amount: 500 }, isCompleted: false, progress: 0 },
            { id: 'battle_5', name: '传说战士', description: '通过第1000波', icon: 'icon_battle', type: 'battle', requirement: 1000, reward: { type: 'diamond', amount: 1000 }, isCompleted: false, progress: 0 },
            
            // 收集成就
            { id: 'collect_1', name: '萌宠收集家', description: '收集5只不同的萌宠', icon: 'icon_pet', type: 'collection', requirement: 5, reward: { type: 'gold', amount: 200 }, isCompleted: false, progress: 0 },
            { id: 'collect_2', name: '萌宠大师', description: '收集10只不同的萌宠', icon: 'icon_pet', type: 'collection', requirement: 10, reward: { type: 'diamond', amount: 50 }, isCompleted: false, progress: 0 },
            { id: 'collect_3', name: '萌宠收藏家', description: '收集20只不同的萌宠', icon: 'icon_pet', type: 'collection', requirement: 20, reward: { type: 'diamond', amount: 100 }, isCompleted: false, progress: 0 },
            { id: 'collect_4', name: 'SSR收藏家', description: '获得3只SSR萌宠', icon: 'icon_pet', type: 'collection', requirement: 3, reward: { type: 'diamond', amount: 200 }, isCompleted: false, progress: 0 },
            
            // 抽卡成就
            { id: 'gacha_1', name: '初次抽卡', description: '进行10次抽卡', icon: 'icon_gacha', type: 'collection', requirement: 10, reward: { type: 'gold', amount: 300 }, isCompleted: false, progress: 0 },
            { id: 'gacha_2', name: '抽卡爱好者', description: '进行100次抽卡', icon: 'icon_gacha', type: 'collection', requirement: 100, reward: { type: 'diamond', amount: 100 }, isCompleted: false, progress: 0 },
            { id: 'gacha_3', name: '抽卡大师', description: '进行1000次抽卡', icon: 'icon_gacha', type: 'collection', requirement: 1000, reward: { type: 'diamond', amount: 500 }, isCompleted: false, progress: 0 },
            
            // 社交成就
            { id: 'social_1', name: '好友互助', description: '向好友赠送体力10次', icon: 'icon_friend', type: 'social', requirement: 10, reward: { type: 'energy', amount: 20 }, isCompleted: false, progress: 0 },
            { id: 'social_2', name: '分享达人', description: '分享游戏10次', icon: 'icon_share', type: 'social', requirement: 10, reward: { type: 'diamond', amount: 50 }, isCompleted: false, progress: 0 },
            
            // 特殊成就
            { id: 'special_1', name: '连续登录', description: '连续登录7天', icon: 'icon_login', type: 'special', requirement: 7, reward: { type: 'diamond', amount: 100 }, isCompleted: false, progress: 0 },
            { id: 'special_2', name: '战令达人', description: '战令达到50级', icon: 'icon_battlepass', type: 'special', requirement: 50, reward: { type: 'diamond', amount: 200 }, isCompleted: false, progress: 0 },
        ];
        
        achievementList.forEach(ach => {
            this.achievements.set(ach.id, ach);
        });
    }
    
    /**
     * 更新成就进度
     */
    updateProgress(achievementId: string, progress: number): void {
        const achievement = this.achievements.get(achievementId);
        if (!achievement || achievement.isCompleted) return;
        
        achievement.progress = Math.min(progress, achievement.requirement);
        
        // 检查是否完成
        if (achievement.progress >= achievement.requirement) {
            this.completeAchievement(achievementId);
        }
        
        this.saveData();
    }
    
    /**
     * 增加成就进度
     */
    addProgress(achievementId: string, amount: number = 1): void {
        const achievement = this.achievements.get(achievementId);
        if (!achievement) return;
        
        this.updateProgress(achievementId, achievement.progress + amount);
    }
    
    /**
     * 完成成就
     */
    private completeAchievement(achievementId: string): void {
        const achievement = this.achievements.get(achievementId);
        if (!achievement || achievement.isCompleted) return;
        
        achievement.isCompleted = true;
        this.completedAchievements.push(achievementId);
        
        // 发放奖励
        this.grantReward(achievement.reward);
        
        // 触发事件
        AchievementEvent.emit('achievementCompleted', achievement);
        
        console.log(`成就完成: ${achievement.name}`);
    }
    
    /**
     * 发放奖励
     */
    private grantReward(reward: { type: string, amount: number }): void {
        // TODO: 发放奖励到玩家账户
        console.log(`发放成就奖励: ${reward.type} x${reward.amount}`);
    }
    
    /**
     * 获取所有成就
     */
    getAllAchievements(): Achievement[] {
        return Array.from(this.achievements.values());
    }
    
    /**
     * 获取已完成成就
     */
    getCompletedAchievements(): Achievement[] {
        return this.getAllAchievements().filter(a => a.isCompleted);
    }
    
    /**
     * 获取未完成成就
     */
    getIncompleteAchievements(): Achievement[] {
        return this.getAllAchievements().filter(a => !a.isCompleted);
    }
    
    /**
     * 按类型获取成就
     */
    getAchievementsByType(type: string): Achievement[] {
        return this.getAllAchievements().filter(a => a.type === type);
    }
    
    /**
     * 检查成就是否完成
     */
    isCompleted(achievementId: string): boolean {
        return this.completedAchievements.includes(achievementId);
    }
    
    /**
     * 获取完成进度
     */
    getOverallProgress(): { completed: number, total: number, percentage: number } {
        const total = this.achievements.size;
        const completed = this.completedAchievements.length;
        const percentage = Math.floor((completed / total) * 100);
        
        return { completed, total, percentage };
    }
    
    /**
     * 保存数据
     */
    private saveData(): void {
        const data = {
            completed: this.completedAchievements,
            achievements: Array.from(this.achievements.entries())
        };
        localStorage.setItem('achievements', JSON.stringify(data));
    }
    
    /**
     * 加载数据
     */
    private loadData(): void {
        const saved = localStorage.getItem('achievements');
        if (!saved) return;
        
        try {
            const data = JSON.parse(saved);
            this.completedAchievements = data.completed || [];
            
            // 恢复成就进度
            if (data.achievements) {
                data.achievements.forEach(([id, ach]: [string, Achievement]) => {
                    if (this.achievements.has(id)) {
                        const existing = this.achievements.get(id);
                        existing.progress = ach.progress;
                        existing.isCompleted = ach.isCompleted;
                    }
                });
            }
        } catch (e) {
            console.error('加载成就数据失败:', e);
        }
    }
}