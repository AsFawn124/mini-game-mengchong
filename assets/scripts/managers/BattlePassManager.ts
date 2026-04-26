import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

/**
 * 战令奖励
 */
export interface BattlePassReward {
    level: number;
    freeReward: { type: string, amount: number };
    premiumReward: { type: string, amount: number };
}

/**
 * 战令管理器
 * 负责战令系统、赛季、奖励发放
 */
@ccclass('BattlePassManager')
export class BattlePassManager extends Component {
    
    // 单例
    private static _instance: BattlePassManager = null;
    public static get instance(): BattlePassManager {
        return BattlePassManager._instance;
    }
    
    // 战令配置
    private readonly MAX_LEVEL = 50;
    private readonly EXP_PER_LEVEL = 1000;
    
    // 玩家战令数据
    private playerData = {
        level: 1,
        exp: 0,
        isPremium: false, // 是否购买高级战令
        claimedRewards: [] as number[], // 已领取的等级
        seasonId: 'season_1'
    };
    
    // 战令奖励配置
    private rewards: BattlePassReward[] = [];
    
    onLoad() {
        if (BattlePassManager._instance === null) {
            BattlePassManager._instance = this;
        }
        this.initRewards();
        this.loadPlayerData();
    }
    
    /**
     * 初始化奖励配置
     */
    private initRewards(): void {
        for (let i = 1; i <= this.MAX_LEVEL; i++) {
            const reward: BattlePassReward = {
                level: i,
                freeReward: this.generateFreeReward(i),
                premiumReward: this.generatePremiumReward(i)
            };
            this.rewards.push(reward);
        }
    }
    
    /**
     * 生成免费奖励
     */
    private generateFreeReward(level: number): { type: string, amount: number } {
        if (level % 10 === 0) {
            return { type: 'diamond', amount: level * 10 };
        } else if (level % 5 === 0) {
            return { type: 'gacha_ticket', amount: 1 };
        } else {
            return { type: 'gold', amount: level * 100 };
        }
    }
    
    /**
     * 生成高级奖励
     */
    private generatePremiumReward(level: number): { type: string, amount: number } {
        if (level === 50) {
            return { type: 'exclusive_pet', amount: 1 }; // 专属萌宠
        } else if (level % 10 === 0) {
            return { type: 'diamond', amount: level * 20 };
        } else if (level % 5 === 0) {
            return { type: 'gacha_ticket', amount: 3 };
        } else {
            return { type: 'gold', amount: level * 300 };
        }
    }
    
    /**
     * 增加战令经验
     */
    addExp(amount: number): void {
        this.playerData.exp += amount;
        
        // 检查升级
        while (this.playerData.exp >= this.getRequiredExp() && this.playerData.level < this.MAX_LEVEL) {
            this.playerData.exp -= this.getRequiredExp();
            this.playerData.level++;
            this.onLevelUp();
        }
        
        this.savePlayerData();
    }
    
    /**
     * 获取升级所需经验
     */
    private getRequiredExp(): number {
        return this.EXP_PER_LEVEL;
    }
    
    /**
     * 升级回调
     */
    private onLevelUp(): void {
        console.log(`战令升级！当前等级: ${this.playerData.level}`);
        // TODO: 显示升级提示
    }
    
    /**
     * 领取奖励
     */
    claimReward(level: number): boolean {
        if (this.playerData.level < level) {
            console.log('等级不足');
            return false;
        }
        
        if (this.playerData.claimedRewards.includes(level)) {
            console.log('已领取');
            return false;
        }
        
        const reward = this.rewards.find(r => r.level === level);
        if (!reward) return false;
        
        // 发放免费奖励
        this.grantReward(reward.freeReward);
        
        // 发放高级奖励
        if (this.playerData.isPremium) {
            this.grantReward(reward.premiumReward);
        }
        
        this.playerData.claimedRewards.push(level);
        this.savePlayerData();
        
        return true;
    }
    
    /**
     * 发放奖励
     */
    private grantReward(reward: { type: string, amount: number }): void {
        console.log(`发放奖励: ${reward.type} x${reward.amount}`);
        // TODO: 实际发放到玩家账户
    }
    
    /**
     * 购买高级战令
     */
    async buyPremium(): Promise<boolean> {
        // TODO: 接入支付
        console.log('购买高级战令');
        
        this.playerData.isPremium = true;
        this.savePlayerData();
        
        // 补发之前等级的高级奖励
        for (let i = 1; i <= this.playerData.level; i++) {
            if (!this.playerData.claimedRewards.includes(i)) {
                const reward = this.rewards.find(r => r.level === i);
                if (reward) {
                    this.grantReward(reward.premiumReward);
                }
            }
        }
        
        return true;
    }
    
    /**
     * 获取战令等级
     */
    getLevel(): number {
        return this.playerData.level;
    }
    
    /**
     * 获取当前经验
     */
    getExp(): number {
        return this.playerData.exp;
    }
    
    /**
     * 获取升级进度
     */
    getProgress(): number {
        return this.playerData.exp / this.getRequiredExp();
    }
    
    /**
     * 是否购买了高级战令
     */
    isPremiumUser(): boolean {
        return this.playerData.isPremium;
    }
    
    /**
     * 获取可领取的奖励列表
     */
    getClaimableRewards(): number[] {
        const claimable = [];
        for (let i = 1; i <= this.playerData.level; i++) {
            if (!this.playerData.claimedRewards.includes(i)) {
                claimable.push(i);
            }
        }
        return claimable;
    }
    
    /**
     * 获取所有奖励配置
     */
    getAllRewards(): BattlePassReward[] {
        return this.rewards;
    }
    
    /**
     * 完成任务获得经验
     */
    completeTask(taskType: string): void {
        const expMap: { [key: string]: number } = {
            'daily_login': 100,
            'battle_1': 50,
            'battle_3': 150,
            'gacha_1': 100,
            'share': 50,
            'watch_ad': 30
        };
        
        const exp = expMap[taskType] || 0;
        if (exp > 0) {
            this.addExp(exp);
            console.log(`完成任务获得${exp}经验`);
        }
    }
    
    /**
     * 加载玩家数据
     */
    private loadPlayerData(): void {
        const saved = localStorage.getItem('battlePassData');
        if (saved) {
            this.playerData = JSON.parse(saved);
        }
    }
    
    /**
     * 保存玩家数据
     */
    private savePlayerData(): void {
        localStorage.setItem('battlePassData', JSON.stringify(this.playerData));
    }
}