/**
 * 成就管理器
 * 管理游戏成就系统
 */

import GameMain from '../GameMain';
import { EventManager } from '../utils/GameUtils';

const { ccclass } = cc._decorator;

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    requirement: number;
    reward: number;  // 钻石奖励
    unlocked: boolean;
    claimed: boolean;
    progress: number;
}

export type AchievementCategory = 
    | 'collection'   // 收集类
    | 'battle'       // 战斗类
    | 'growth'       // 成长类
    | 'social'       // 社交类
    | 'special';     // 特殊类

@ccclass
export class AchievementManager extends cc.Component {
    
    private _achievements: Achievement[] = [];
    
    // 成就配置
    private readonly _achievementConfigs: Omit<Achievement, 'unlocked' | 'claimed' | 'progress'>[] = [
        // 收集类
        {
            id: 'first_pet',
            name: '初次相遇',
            description: '获得第一只萌宠',
            icon: 'achievement/first_pet',
            category: 'collection',
            requirement: 1,
            reward: 50
        },
        {
            id: 'collector_10',
            name: '初级收藏家',
            description: '收集10只不同萌宠',
            icon: 'achievement/collector',
            category: 'collection',
            requirement: 10,
            reward: 100
        },
        {
            id: 'collector_30',
            name: '高级收藏家',
            description: '收集30只不同萌宠',
            icon: 'achievement/collector2',
            category: 'collection',
            requirement: 30,
            reward: 300
        },
        {
            id: 'collector_50',
            name: '萌宠大师',
            description: '收集全部50只萌宠',
            icon: 'achievement/master',
            category: 'collection',
            requirement: 50,
            reward: 1000
        },
        {
            id: 'first_ssr',
            name: '欧皇附体',
            description: '首次获得SSR萌宠',
            icon: 'achievement/ssr',
            category: 'collection',
            requirement: 1,
            reward: 500
        },
        {
            id: 'ssr_collector',
            name: 'SSR收藏家',
            description: '收集全部5只SSR萌宠',
            icon: 'achievement/ssr_collector',
            category: 'collection',
            requirement: 5,
            reward: 2000
        },
        
        // 战斗类
        {
            id: 'first_battle',
            name: '初出茅庐',
            description: '完成第一场战斗',
            icon: 'achievement/battle',
            category: 'battle',
            requirement: 1,
            reward: 50
        },
        {
            id: 'battle_10',
            name: '战斗新手',
            description: '完成10场战斗',
            icon: 'achievement/battle2',
            category: 'battle',
            requirement: 10,
            reward: 100
        },
        {
            id: 'battle_100',
            name: '战斗达人',
            description: '完成100场战斗',
            icon: 'achievement/battle3',
            category: 'battle',
            requirement: 100,
            reward: 300
        },
        {
            id: 'wave_10',
            name: '坚持10波',
            description: '单局达到10波',
            icon: 'achievement/wave',
            category: 'battle',
            requirement: 10,
            reward: 100
        },
        {
            id: 'wave_30',
            name: '坚持30波',
            description: '单局达到30波',
            icon: 'achievement/wave2',
            category: 'battle',
            requirement: 30,
            reward: 300
        },
        {
            id: 'wave_50',
            name: '无尽挑战者',
            description: '单局达到50波',
            icon: 'achievement/wave3',
            category: 'battle',
            requirement: 50,
            reward: 1000
        },
        {
            id: 'win_streak_5',
            name: '五连胜',
            description: '连续获得5场胜利',
            icon: 'achievement/streak',
            category: 'battle',
            requirement: 5,
            reward: 200
        },
        
        // 成长类
        {
            id: 'first_merge',
            name: '初次合成',
            description: '成功合成1次',
            icon: 'achievement/merge',
            category: 'growth',
            requirement: 1,
            reward: 50
        },
        {
            id: 'merge_10',
            name: '合成大师',
            description: '成功合成10次',
            icon: 'achievement/merge2',
            category: 'growth',
            requirement: 10,
            reward: 200
        },
        {
            id: 'first_levelup',
            name: '首次升级',
            description: '将萌宠升到2级',
            icon: 'achievement/levelup',
            category: 'growth',
            requirement: 1,
            reward: 50
        },
        {
            id: 'max_level',
            name: '满级大佬',
            description: '将萌宠升到满级',
            icon: 'achievement/maxlevel',
            category: 'growth',
            requirement: 1,
            reward: 500
        },
        {
            id: 'gacha_10',
            name: '抽卡新手',
            description: '累计抽卡10次',
            icon: 'achievement/gacha',
            category: 'growth',
            requirement: 10,
            reward: 100
        },
        {
            id: 'gacha_100',
            name: '抽卡狂人',
            description: '累计抽卡100次',
            icon: 'achievement/gacha2',
            category: 'growth',
            requirement: 100,
            reward: 500
        },
        
        // 社交类
        {
            id: 'first_share',
            name: '分享快乐',
            description: '首次分享游戏',
            icon: 'achievement/share',
            category: 'social',
            requirement: 1,
            reward: 50
        },
        {
            id: 'share_10',
            name: '传播者',
            description: '累计分享10次',
            icon: 'achievement/share2',
            category: 'social',
            requirement: 10,
            reward: 200
        },
        {
            id: 'rank_top10',
            name: '排行榜前十',
            description: '进入排行榜前10名',
            icon: 'achievement/rank',
            category: 'social',
            requirement: 1,
            reward: 500
        },
        
        // 特殊类
        {
            id: 'tutorial_complete',
            name: '新手毕业',
            description: '完成新手引导',
            icon: 'achievement/tutorial',
            category: 'special',
            requirement: 1,
            reward: 100
        },
        {
            id: 'login_7',
            name: '七日登录',
            description: '连续登录7天',
            icon: 'achievement/login',
            category: 'special',
            requirement: 7,
            reward: 300
        },
        {
            id: 'login_30',
            name: '忠实玩家',
            description: '累计登录30天',
            icon: 'achievement/login2',
            category: 'special',
            requirement: 30,
            reward: 1000
        }
    ];
    
    onLoad() {
        console.log('[AchievementManager] 初始化');
        this._initAchievements();
        this._bindEvents();
    }
    
    /**
     * 初始化成就
     */
    private _initAchievements(): void {
        const saved = this._loadAchievements();
        
        if (saved && saved.length > 0) {
            // 合并保存的数据和配置
            this._achievements = this._achievementConfigs.map(config => {
                const savedData = saved.find(s => s.id === config.id);
                return {
                    ...config,
                    unlocked: savedData?.unlocked || false,
                    claimed: savedData?.claimed || false,
                    progress: savedData?.progress || 0
                };
            });
        } else {
            // 初始化新数据
            this._achievements = this._achievementConfigs.map(config => ({
                ...config,
                unlocked: false,
                claimed: false,
                progress: 0
            }));
        }
    }
    
    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventManager.instance.on('pet_obtained', this._onPetObtained, this);
        EventManager.instance.on('battle_complete', this._onBattleComplete, this);
        EventManager.instance.on('merge_complete', this._onMergeComplete, this);
        EventManager.instance.on('levelup_complete', this._onLevelUpComplete, this);
        EventManager.instance.on('gacha_complete', this._onGachaComplete, this);
        EventManager.instance.on('share_complete', this._onShareComplete, this);
        EventManager.instance.on('tutorial_complete', this._onTutorialComplete, this);
    }
    
    /**
     * 更新成就进度
     */
    public updateProgress(achievementId: string, progress: number): void {
        const achievement = this._achievements.find(a => a.id === achievementId);
        
        if (!achievement || achievement.unlocked) return;
        
        achievement.progress = Math.max(achievement.progress, progress);
        
        // 检查是否解锁
        if (achievement.progress >= achievement.requirement) {
            this._unlockAchievement(achievement);
        }
        
        this._saveAchievements();
    }
    
    /**
     * 增加成就进度
     */
    public addProgress(achievementId: string, add: number = 1): void {
        const achievement = this._achievements.find(a => a.id === achievementId);
        
        if (!achievement || achievement.unlocked) return;
        
        this.updateProgress(achievementId, achievement.progress + add);
    }
    
    /**
     * 解锁成就
     */
    private _unlockAchievement(achievement: Achievement): void {
        achievement.unlocked = true;
        
        console.log(`[AchievementManager] 成就解锁: ${achievement.name}`);
        
        // 发送解锁事件
        cc.game.emit('achievement_unlocked', achievement);
    }
    
    /**
     * 领取成就奖励
     */
    public claimReward(achievementId: string): boolean {
        const achievement = this._achievements.find(a => a.id === achievementId);
        
        if (!achievement || !achievement.unlocked || achievement.claimed) {
            return false;
        }
        
        // 发放奖励
        console.log(`[AchievementManager] 领取奖励: ${achievement.name} - ${achievement.reward}钻石`);
        
        achievement.claimed = true;
        this._saveAchievements();
        
        cc.game.emit('achievement_reward_claimed', achievement);
        
        return true;
    }
    
    /**
     * 一键领取所有奖励
     */
    public claimAllRewards(): number {
        let totalReward = 0;
        
        this._achievements.forEach(achievement => {
            if (achievement.unlocked && !achievement.claimed) {
                totalReward += achievement.reward;
                achievement.claimed = true;
            }
        });
        
        if (totalReward > 0) {
            console.log(`[AchievementManager] 一键领取奖励: ${totalReward}钻石`);
            this._saveAchievements();
        }
        
        return totalReward;
    }
    
    /**
     * 获取所有成就
     */
    public getAchievements(): Achievement[] {
        return [...this._achievements];
    }
    
    /**
     * 按分类获取成就
     */
    public getAchievementsByCategory(category: AchievementCategory): Achievement[] {
        return this._achievements.filter(a => a.category === category);
    }
    
    /**
     * 获取已解锁成就数量
     */
    public getUnlockedCount(): number {
        return this._achievements.filter(a => a.unlocked).length;
    }
    
    /**
     * 获取总成就数量
     */
    public getTotalCount(): number {
        return this._achievements.length;
    }
    
    /**
     * 获取未领取奖励的成就数量
     */
    public getUnclaimedCount(): number {
        return this._achievements.filter(a => a.unlocked && !a.claimed).length;
    }
    
    /**
     * 获取成就完成度百分比
     */
    public getCompletionPercentage(): number {
        return Math.floor((this.getUnlockedCount() / this.getTotalCount()) * 100);
    }
    
    // 事件处理
    private _onPetObtained(data: { count: number; hasSSR: boolean }): void {
        this.updateProgress('first_pet', 1);
        this.updateProgress('collector_10', data.count);
        this.updateProgress('collector_30', data.count);
        this.updateProgress('collector_50', data.count);
        
        if (data.hasSSR) {
            this.updateProgress('first_ssr', 1);
            // SSR数量需要另外统计
        }
    }
    
    private _onBattleComplete(data: { wave: number; victory: boolean }): void {
        this.addProgress('first_battle');
        this.addProgress('battle_10');
        this.addProgress('battle_100');
        
        this.updateProgress('wave_10', data.wave);
        this.updateProgress('wave_30', data.wave);
        this.updateProgress('wave_50', data.wave);
        
        if (data.victory) {
            // 连胜需要额外记录
        }
    }
    
    private _onMergeComplete(): void {
        this.updateProgress('first_merge', 1);
        this.addProgress('merge_10');
    }
    
    private _onLevelUpComplete(data: { level: number }): void {
        this.updateProgress('first_levelup', 1);
        
        if (data.level >= 60) {
            this.updateProgress('max_level', 1);
        }
    }
    
    private _onGachaComplete(data: { totalCount: number }): void {
        this.updateProgress('gacha_10', data.totalCount);
        this.updateProgress('gacha_100', data.totalCount);
    }
    
    private _onShareComplete(): void {
        this.updateProgress('first_share', 1);
        this.addProgress('share_10');
    }
    
    private _onTutorialComplete(): void {
        this.updateProgress('tutorial_complete', 1);
    }
    
    /**
     * 保存成就数据
     */
    private _saveAchievements(): void {
        try {
            const data = this._achievements.map(a => ({
                id: a.id,
                unlocked: a.unlocked,
                claimed: a.claimed,
                progress: a.progress
            }));
            cc.sys.localStorage.setItem('achievements', JSON.stringify(data));
        } catch (e) {
            console.error('[AchievementManager] 保存成就失败', e);
        }
    }
    
    /**
     * 加载成就数据
     */
    private _loadAchievements(): any[] {
        try {
            const data = cc.sys.localStorage.getItem('achievements');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[AchievementManager] 加载成就失败', e);
            return [];
        }
    }
    
    /**
     * 重置所有成就（用于测试）
     */
    public resetAll(): void {
        this._achievements.forEach(a => {
            a.unlocked = false;
            a.claimed = false;
            a.progress = 0;
        });
        this._saveAchievements();
        console.log('[AchievementManager] 所有成就已重置');
    }
    
    onDestroy() {
        EventManager.instance.off('pet_obtained', this._onPetObtained, this);
        EventManager.instance.off('battle_complete', this._onBattleComplete, this);
        EventManager.instance.off('merge_complete', this._onMergeComplete, this);
        EventManager.instance.off('levelup_complete', this._onLevelUpComplete, this);
        EventManager.instance.off('gacha_complete', this._onGachaComplete, this);
        EventManager.instance.off('share_complete', this._onShareComplete, this);
        EventManager.instance.off('tutorial_complete', this._onTutorialComplete, this);
    }
}
