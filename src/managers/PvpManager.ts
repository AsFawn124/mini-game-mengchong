/**
 * PvpManager - PvP对战管理器
 * 支持实时对战和异步匹配两种模式
 * 微信小游戏环境使用帧同步，Web环境使用WebSocket
 */

import { PetEntity, PetRarity } from '../entities/PetEntity';
import { GameConfig } from '../GameConfig';

// PvP匹配状态
export enum PvpMatchState {
    IDLE = 'idle',
    MATCHING = 'matching',
    MATCHED = 'matched',
    BATTLE_READY = 'battle_ready',
    IN_BATTLE = 'in_battle',
    BATTLE_END = 'battle_end'
}

// 对战结果
export interface PvpBattleResult {
    win: boolean;
    playerScore: number;
    opponentScore: number;
    earnedPoints: number;
    earnedCoins: number;
    mvpPetId: string;
    battleLog: PvpRoundLog[];
}

// 单回合日志
export interface PvpRoundLog {
    round: number;
    attackerPetName: string;
    defenderPetName: string;
    damage: number;
    isCrit: boolean;
    skillUsed: string;
}

// 对手信息
export interface PvpOpponent {
    id: string;
    nickname: string;
    avatar: string;
    rank: number;
    rating: number;
    pets: PetEntity[];
    winRate: number;
    totalBattles: number;
}

// 段位系统
export enum PvpTier {
    BRONZE = '青铜',
    SILVER = '白银',
    GOLD = '黄金',
    PLATINUM = '铂金',
    DIAMOND = '钻石',
    MASTER = '大师',
    GRANDMASTER = '宗师',
    LEGEND = '传说'
}

export class PvpManager {
    private static instance: PvpManager;

    // 玩家PvP数据
    private rating: number = 1000;
    private tier: PvpTier = PvpTier.BRONZE;
    private winCount: number = 0;
    private loseCount: number = 0;
    private winStreak: number = 0;
    private maxWinStreak: number = 0;

    // 匹配状态
    private matchState: PvpMatchState = PvpMatchState.IDLE;
    private opponent: PvpOpponent | null = null;
    private matchStartTime: number = 0;
    private readonly MATCH_TIMEOUT = 30000; // 30秒匹配超时

    // 段位分数配置
    private readonly TIER_THRESHOLDS: Map<PvpTier, number> = new Map([
        [PvpTier.BRONZE, 0],
        [PvpTier.SILVER, 1200],
        [PvpTier.GOLD, 1400],
        [PvpTier.PLATINUM, 1600],
        [PvpTier.DIAMOND, 1800],
        [PvpTier.MASTER, 2000],
        [PvpTier.GRANDMASTER, 2200],
        [PvpTier.LEGEND, 2500]
    ]);

    // 赛季数据
    private seasonId: number = 1;
    private seasonStartTime: number = 0;
    private seasonEndTime: number = 0;
    private seasonRewards: Map<string, any> = new Map();
    private readonly SEASON_DURATION = 30 * 24 * 3600 * 1000; // 30天一个赛季

    // 回调
    private onMatchFound: ((opponent: PvpOpponent) => void) | null = null;
    private onBattleEnd: ((result: PvpBattleResult) => void) | null = null;
    private onRatingChanged: ((newRating: number, newTier: PvpTier) => void) | null = null;

    private constructor() {
        // 加载本地PvP数据
        this.loadLocalData();
        this.initSeason();
    }

    public static getInstance(): PvpManager {
        if (!PvpManager.instance) {
            PvpManager.instance = new PvpManager();
        }
        return PvpManager.instance;
    }

    // ==================== 匹配系统 ====================

    /**
     * 开始匹配对手
     */
    public startMatchmaking(roster: PetEntity[]): void {
        if (roster.length < 3) {
            console.warn('[PvP] 至少需要3只萌宠才能参加PvP对战');
            return;
        }

        if (this.matchState !== PvpMatchState.IDLE) {
            console.warn('[PvP] 已在匹配中');
            return;
        }

        this.matchState = PvpMatchState.MATCHING;
        this.matchStartTime = Date.now();

        console.log(`[PvP] 开始匹配... 当前段位: ${this.tier}, 分数: ${this.rating}`);

        // 模拟匹配延迟（实际环境应通过服务器匹配）
        const matchDelay = Math.random() * 3000 + 1000;
        setTimeout(() => {
            if (this.matchState === PvpMatchState.MATCHING) {
                this.opponent = this.generateOpponent();
                this.matchState = PvpMatchState.MATCHED;
                console.log(`[PvP] 匹配成功! 对手: ${this.opponent.nickname} (${this.opponent.tier})`);

                if (this.onMatchFound && this.opponent) {
                    this.onMatchFound(this.opponent);
                }
            }
        }, matchDelay);

        // 匹配超时处理
        setTimeout(() => {
            if (this.matchState === PvpMatchState.MATCHING) {
                this.matchState = PvpMatchState.IDLE;
                console.log('[PvP] 匹配超时，请重试');
            }
        }, this.MATCH_TIMEOUT);
    }

    /**
     * 取消匹配
     */
    public cancelMatchmaking(): void {
        if (this.matchState === PvpMatchState.MATCHING) {
            this.matchState = PvpMatchState.IDLE;
            console.log('[PvP] 匹配已取消');
        }
    }

    // ==================== 对战逻辑 ====================

    /**
     * 模拟PvP对战（异步模式）
     * 实际环境应通过服务器进行实时对战
     */
    public async simulateBattle(playerPets: PetEntity[]): Promise<PvpBattleResult> {
        if (!this.opponent) {
            throw new Error('No opponent matched');
        }

        this.matchState = PvpMatchState.IN_BATTLE;
        const battleLog: PvpRoundLog[] = [];
        let playerScore = 0;
        let opponentScore = 0;
        let mvpDamage = 0;
        let mvpPetId = '';

        // 最多10回合
        const maxRounds = 10;
        for (let round = 1; round <= maxRounds; round++) {
            const playerPetIndex = (round - 1) % playerPets.length;
            const opponentPetIndex = (round - 1) % this.opponent.pets.length;

            const attacker = playerPets[playerPetIndex];
            const defender = this.opponent.pets[opponentPetIndex];

            // 属性克制加成
            const typeMultiplier = this.getTypeMultiplier(
                attacker.elementType,
                defender.elementType
            );

            // 计算伤害
            const baseDamage = attacker.attack * (1 + Math.random() * 0.3);
            const isCrit = Math.random() < 0.15; // 15%暴击率
            const critMultiplier = isCrit ? 1.8 : 1.0;
            const damage = Math.round(baseDamage * typeMultiplier * critMultiplier);

            playerScore += damage;

            if (damage > mvpDamage) {
                mvpDamage = damage;
                mvpPetId = attacker.id;
            }

            // 对手还击
            const opponentDamage = Math.round(
                defender.attack * (1 + Math.random() * 0.3) *
                this.getTypeMultiplier(defender.elementType, attacker.elementType)
            );
            opponentScore += opponentDamage;

            battleLog.push({
                round,
                attackerPetName: attacker.name,
                defenderPetName: defender.name,
                damage,
                isCrit,
                skillUsed: attacker.skills?.[0]?.name || '普通攻击'
            });
        }

        const win = playerScore > opponentScore;
        const ratingChange = this.calculateRatingChange(win);
        const earnedCoins = win ? 50 + Math.floor(Math.random() * 50) : 10;
        const earnedPoints = win ? ratingChange : Math.max(ratingChange, -15);

        // 更新段位
        const oldTier = this.tier;
        this.rating += earnedPoints;
        this.updateTier();

        if (win) {
            this.winCount++;
            this.winStreak++;
            if (this.winStreak > this.maxWinStreak) {
                this.maxWinStreak = this.winStreak;
            }
        } else {
            this.loseCount++;
            this.winStreak = 0;
        }

        this.matchState = PvpMatchState.BATTLE_END;
        this.saveLocalData();

        const result: PvpBattleResult = {
            win,
            playerScore,
            opponentScore,
            earnedPoints,
            earnedCoins,
            mvpPetId,
            battleLog
        };

        if (this.tier !== oldTier && this.onRatingChanged) {
            this.onRatingChanged(this.rating, this.tier);
        }

        if (this.onBattleEnd) {
            this.onBattleEnd(result);
        }

        // 延迟重置状态
        setTimeout(() => {
            this.matchState = PvpMatchState.IDLE;
            this.opponent = null;
        }, 2000);

        return result;
    }

    // ==================== 辅助计算 ====================

    /**
     * 属性克制倍率
     */
    private getTypeMultiplier(attackerType: string, defenderType: string): number {
        const typeChart: Record<string, Record<string, number>> = {
            'fire': { grass: 1.5, water: 0.5, dark: 1.2 },
            'water': { fire: 1.5, grass: 0.5, light: 1.2 },
            'grass': { water: 1.5, fire: 0.5, dark: 1.2 },
            'light': { dark: 1.5, light: 0.75 },
            'dark': { light: 1.5, dark: 0.75 }
        };

        return typeChart[attackerType]?.[defenderType] || 1.0;
    }

    /**
     * 计算段位分变化（ELO风格）
     */
    private calculateRatingChange(win: boolean): number {
        const baseK = 25;
        const streakBonus = Math.min(this.winStreak * 3, 15);
        const expectedScore = 1 / (1 + Math.pow(10, (this.opponent!.rating - this.rating) / 400));

        const kFactor = baseK + (win ? streakBonus : 0);
        const change = Math.round(kFactor * ((win ? 1 : 0) - expectedScore));

        return Math.max(Math.min(change, 40), -35);
    }

    /**
     * 更新段位
     */
    private updateTier(): void {
        const sortedTiers = Array.from(this.TIER_THRESHOLDS.entries())
            .sort((a, b) => b[1] - a[1]);

        for (const [tierName, threshold] of sortedTiers) {
            if (this.rating >= threshold) {
                this.tier = tierName;
                break;
            }
        }
    }

    /**
     * 生成模拟对手
     */
    private generateOpponent(): PvpOpponent {
        const tierRatings = {
            [PvpTier.BRONZE]: { min: 800, max: 1199 },
            [PvpTier.SILVER]: { min: 1200, max: 1399 },
            [PvpTier.GOLD]: { min: 1400, max: 1599 },
            [PvpTier.PLATINUM]: { min: 1600, max: 1799 },
            [PvpTier.DIAMOND]: { min: 1800, max: 1999 },
            [PvpTier.MASTER]: { min: 2000, max: 2199 },
            [PvpTier.GRANDMASTER]: { min: 2200, max: 2499 },
            [PvpTier.LEGEND]: { min: 2500, max: 3000 }
        };

        const range = tierRatings[this.tier] || tierRatings[PvpTier.BRONZE];
        const opponentRating = Math.floor(Math.random() * (range.max - range.min) + range.min);

        // 根据分数确定对手段位
        let opponentTier = PvpTier.BRONZE;
        for (const [tier, threshold] of this.TIER_THRESHOLDS) {
            if (opponentRating >= threshold) {
                opponentTier = tier;
            }
        }

        const nicknames = [
            '萌萌训练师', '宠物大师', '萌宠猎人', '元素使者',
            '星之守护', '幻兽骑士', '宠物联盟', '萌新上路',
            '竞技达人', '精灵召唤师', '驯兽宗师', '萌萌哒'
        ];

        // 生成对手萌宠
        const pets: PetEntity[] = [];
        for (let i = 0; i < 5; i++) {
            const level = Math.floor(15 + this.rating / 50 + Math.random() * 10);
            pets.push({
                id: `opponent_pet_${i}`,
                name: `对手萌宠${i + 1}`,
                rarity: PetRarity.SR,
                level,
                elementType: ['fire', 'water', 'grass', 'light', 'dark'][Math.floor(Math.random() * 5)],
                attack: 50 + level * 5,
                defense: 40 + level * 4,
                hp: 200 + level * 20,
                skills: [{ name: '元素冲击', damage: 30 + level * 3, cooldown: 2, description: '基础攻击' }],
                evolutionLine: undefined,
                starLevel: 3
            });
        }

        return {
            id: `player_${Math.random().toString(36).substr(2, 9)}`,
            nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
            avatar: '',
            rank: Math.floor(Math.random() * 1000) + 1,
            rating: opponentRating,
            tier: opponentTier,
            pets,
            winRate: Math.random() * 30 + 40, // 40-70%
            totalBattles: Math.floor(Math.random() * 200) + 10
        };
    }

    // ==================== 赛季系统 ====================

    private initSeason(): void {
        const now = Date.now();
        if (this.seasonStartTime === 0) {
            this.seasonStartTime = now;
            this.seasonEndTime = now + this.SEASON_DURATION;
            this.seasonId = Math.floor(now / this.SEASON_DURATION);
        }
    }

    public getSeasonInfo(): { id: number; remainingDays: number; rewards: any[] } {
        const remaining = Math.max(0, Math.ceil((this.seasonEndTime - Date.now()) / (24 * 3600 * 1000)));
        return {
            id: this.seasonId,
            remainingDays: remaining,
            rewards: this.getSeasonRewards()
        };
    }

    private getSeasonRewards(): any[] {
        const rewards = [
            { tier: PvpTier.BRONZE, coins: 100, items: ['普通抽卡券x1'] },
            { tier: PvpTier.SILVER, coins: 200, items: ['普通抽卡券x2', '经验药水x3'] },
            { tier: PvpTier.GOLD, coins: 500, items: ['高级抽卡券x1', '经验药水x5'] },
            { tier: PvpTier.PLATINUM, coins: 1000, items: ['高级抽卡券x2', '进化石x2'] },
            { tier: PvpTier.DIAMOND, coins: 2000, items: ['特级抽卡券x1', '进化石x5', '专属头像框'] },
            { tier: PvpTier.MASTER, coins: 5000, items: ['特级抽卡券x2', 'SSR萌宠碎片x10'] },
            { tier: PvpTier.GRANDMASTER, coins: 10000, items: ['特级抽卡券x5', 'UR萌宠碎片x5', '赛季皮肤'] },
            { tier: PvpTier.LEGEND, coins: 20000, items: ['UR萌宠任选x1', '传说头像框', '专属称号'] }
        ];
        return rewards.filter(r => this.TIER_THRESHOLDS.get(r.tier)! <= this.rating);
    }

    // ==================== 数据持久化 ====================

    private loadLocalData(): void {
        try {
            const data = JSON.parse(GameConfig.loadLocal('pvp_data') || '{}');
            this.rating = data.rating || 1000;
            this.winCount = data.winCount || 0;
            this.loseCount = data.loseCount || 0;
            this.maxWinStreak = data.maxWinStreak || 0;
            this.seasonId = data.seasonId || 1;
            this.updateTier();
        } catch (e) {
            console.warn('[PvP] 加载本地数据失败，使用默认值');
        }
    }

    private saveLocalData(): void {
        const data = {
            rating: this.rating,
            winCount: this.winCount,
            loseCount: this.loseCount,
            maxWinStreak: this.maxWinStreak,
            seasonId: this.seasonId
        };
        GameConfig.saveLocal('pvp_data', JSON.stringify(data));
    }

    // ==================== 回调注册 ====================

    public setOnMatchFound(cb: (opponent: PvpOpponent) => void): void {
        this.onMatchFound = cb;
    }

    public setOnBattleEnd(cb: (result: PvpBattleResult) => void): void {
        this.onBattleEnd = cb;
    }

    public setOnRatingChanged(cb: (rating: number, tier: PvpTier) => void): void {
        this.onRatingChanged = cb;
    }

    // ==================== Getter ====================

    public getRating(): number { return this.rating; }
    public getTier(): PvpTier { return this.tier; }
    public getWinRate(): number {
        const total = this.winCount + this.loseCount;
        return total > 0 ? Math.round((this.winCount / total) * 100) : 0;
    }
    public getMatchState(): PvpMatchState { return this.matchState; }
    public getOpponent(): PvpOpponent | null { return this.opponent; }
    public getStats(): { wins: number; losses: number; winStreak: number; maxWinStreak: number } {
        return {
            wins: this.winCount,
            losses: this.loseCount,
            winStreak: this.winStreak,
            maxWinStreak: this.maxWinStreak
        };
    }
}
