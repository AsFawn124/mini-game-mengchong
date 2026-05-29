/**
 * MarketCompetitionSystem - 市场竞争力系统
 * 集合变现+社交+运营能力，对标商业手游
 * 包含: IAP/广告/通行证/邀请/社交分享/社区/公告/邮件
 */

import { GameConfig } from '../GameConfig';

// ==================== 货币与商店 ====================

export enum CurrencyType {
    GOLD = 'gold',
    GEMS = 'gems',
    ENERGY = 'energy',
    ARENA_COINS = 'arena_coins',
    GUILD_COINS = 'guild_coins',
    EVENT_TOKENS = 'event_tokens',
    SKIN_TOKENS = 'skin_tokens'
}

export interface CurrencyBalance {
    type: CurrencyType;
    amount: number;
    totalEarned: number;
    totalSpent: number;
}

export interface ShopProduct {
    id: string;
    category: 'currency' | 'pack' | 'subscription' | 'deal' | 'skin';
    name: string;
    description: string;
    price: number;          // 人民币
    originalPrice: number;
    discount: number;
    rewards: ProductReward[];
    isLimited: boolean;
    limitCount: number;
    purchasedCount: number;
    isFirstPurchase: boolean;
    validUntil: number;
    tag: string;            // "首充" "限时" "热门" "推荐"
}

export interface ProductReward {
    type: CurrencyType | 'item' | 'pet' | 'skin' | 'ticket';
    id?: string;
    name?: string;
    amount: number;
    rarity?: string;
}

// ==================== 通行证 ====================

export interface BattlePassSeason {
    seasonId: number;
    name: string;
    theme: string;
    startTime: number;
    endTime: number;
    maxLevel: number;
    premiumPrice: number;   // 钻石
    elitePrice: number;
    freeRewards: PassReward[];
    premiumRewards: PassReward[];
    eliteRewards: PassReward[];
}

export interface PassReward {
    level: number;
    expRequired: number;
    items: ProductReward[];
}

// ==================== 邀请裂变 ====================

export interface ReferralData {
    code: string;
    invitedCount: number;
    rewardTier: number;
    referrals: ReferralRecord[];
}

export interface ReferralRecord {
    id: string;
    name: string;
    joinedAt: number;
    completedTutorial: boolean;
    reachedLevel10: boolean;
    madePurchase: boolean;
    rewardsClaimed: number;
}

export interface ReferralMilestone {
    required: number;
    reward: string;
    claimed: boolean;
}

// ==================== 社交分享 ====================

export enum ShareType {
    VICTORY = 'victory',
    HIGH_SCORE = 'high_score',
    SSR_PULL = 'ssr_pull',
    UR_PULL = 'ur_pull',
    BOSS_CLEAR = 'boss_clear',
    PVP_RANK = 'pvp_rank',
    COLLECTION = 'collection',
    INVITE = 'invite',
    DAILY_REWARD = 'daily_reward'
}

export interface ShareTemplate {
    type: ShareType;
    title: string;
    message: string;
    imageId: string;
    coinReward: number;
    gemReward: number;
}

// ==================== 邮件/公告 ====================

export interface GameMail {
    id: string;
    sender: string;
    title: string;
    content: string;
    rewards: ProductReward[];
    sentAt: number;
    expiresAt: number;
    read: boolean;
    claimed: boolean;
}

export interface GameAnnouncement {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    startTime: number;
    endTime: number;
    priority: number;  // 高优先级显示在前
    link?: string;
}

// ==================== 主类 ====================

export class MarketCompetitionSystem {
    private static instance: MarketCompetitionSystem;

    private currencies: Map<CurrencyType, CurrencyBalance> = new Map();
    private shopProducts: ShopProduct[] = [];
    private currentSeason: BattlePassSeason | null = null;
    private passLevel: number = 0;
    private passExp: number = 0;
    private hasPremium: boolean = false;
    private hasElite: boolean = false;

    private referralData: ReferralData;
    private shareTemplates: ShareTemplate[] = [];
    private mails: GameMail[] = [];
    private announcements: GameAnnouncement[] = [];
    
    private totalSpent: number = 0;
    private isFirstPurchase: boolean = true;
    private shareCountToday: number = 0;
    private shareRewardsToday: number = 0;
    private readonly SHARE_REWARD_LIMIT = 5;

    private constructor() {
        this.initCurrencies();
        this.initShop();
        this.initSeason();
        this.initReferral();
        this.initShareTemplates();
        this.initAnnouncements();
        this.loadData();
    }

    public static getInstance(): MarketCompetitionSystem {
        if (!this.instance) this.instance = new MarketCompetitionSystem();
        return this.instance;
    }

    // ==================== 货币 ====================

    private initCurrencies(): void {
        const defaults: [CurrencyType, number][] = [
            [CurrencyType.GOLD, 1000],
            [CurrencyType.GEMS, 100],
            [CurrencyType.ENERGY, 100],
            [CurrencyType.ARENA_COINS, 0],
            [CurrencyType.GUILD_COINS, 0],
            [CurrencyType.EVENT_TOKENS, 0],
            [CurrencyType.SKIN_TOKENS, 0]
        ];

        for (const [type, amount] of defaults) {
            this.currencies.set(type, { type, amount, totalEarned: amount, totalSpent: 0 });
        }
    }

    public getCurrency(type: CurrencyType): number {
        return this.currencies.get(type)?.amount ?? 0;
    }

    public spend(type: CurrencyType, amount: number): boolean {
        const c = this.currencies.get(type);
        if (!c || c.amount < amount) return false;
        c.amount -= amount;
        c.totalSpent += amount;
        this.saveData();
        return true;
    }

    public earn(type: CurrencyType, amount: number, source?: string): void {
        const c = this.currencies.get(type);
        if (!c) return;
        c.amount += amount;
        c.totalEarned += amount;
        this.saveData();
    }

    // ==================== 商店 ====================

    private initShop(): void {
        this.shopProducts = [
            { id: 'first_pack', category: 'pack', name: '新手大礼包',
              description: 'UR萌宠x1 + 300钻石 + 10000金币', price: 6, originalPrice: 60,
              discount: 0.9, rewards: [{ type: 'pet', rarity: 'UR', amount: 1 },
              { type: CurrencyType.GEMS, amount: 300 }, { type: CurrencyType.GOLD, amount: 10000 }],
              isLimited: true, limitCount: 1, purchasedCount: 0,
              isFirstPurchase: true, validUntil: 0, tag: '首充' },
            { id: 'gems_60', category: 'currency', name: '60钻石',
              description: '基础钻石', price: 6, originalPrice: 6, discount: 0,
              rewards: [{ type: CurrencyType.GEMS, amount: 60 }],
              isLimited: false, limitCount: 0, purchasedCount: 0,
              isFirstPurchase: false, validUntil: 0, tag: '' },
            { id: 'gems_300', category: 'currency', name: '300钻石',
              description: '超值钻石 +10%', price: 30, originalPrice: 30, discount: 0,
              rewards: [{ type: CurrencyType.GEMS, amount: 330 }],
              isLimited: false, limitCount: 0, purchasedCount: 0,
              isFirstPurchase: false, validUntil: 0, tag: '热门' },
            { id: 'gems_980', category: 'currency', name: '980钻石',
              description: '豪华钻石 +20%', price: 98, originalPrice: 98, discount: 0,
              rewards: [{ type: CurrencyType.GEMS, amount: 1176 }],
              isLimited: false, limitCount: 0, purchasedCount: 0,
              isFirstPurchase: false, validUntil: 0, tag: '推荐' },
            { id: 'gems_6480', category: 'currency', name: '6480钻石',
              description: '至尊钻石 +50%', price: 648, originalPrice: 648, discount: 0,
              rewards: [{ type: CurrencyType.GEMS, amount: 9720 }],
              isLimited: false, limitCount: 0, purchasedCount: 0,
              isFirstPurchase: false, validUntil: 0, tag: '' },
            { id: 'monthly_card', category: 'subscription', name: '月卡',
              description: '每日100钻石+双倍经验 30天', price: 30, originalPrice: 30, discount: 0,
              rewards: [{ type: CurrencyType.GEMS, amount: 3000 }],
              isLimited: false, limitCount: 0, purchasedCount: 0,
              isFirstPurchase: false, validUntil: 0, tag: '超值' },
            { id: 'weekly_deal', category: 'deal', name: '本周特惠',
              description: '限时7天 半价钻石包', price: 12, originalPrice: 68, discount: 0.82,
              rewards: [{ type: CurrencyType.GEMS, amount: 200 }, { type: 'ticket', amount: 3 }],
              isLimited: true, limitCount: 1, purchasedCount: 0,
              isFirstPurchase: false, validUntil: 0, tag: '限时' }
        ];
    }

    public getShop(): ShopProduct[] { return this.shopProducts; }

    public purchase(productId: string): boolean {
        const p = this.shopProducts.find(x => x.id === productId);
        if (!p || (p.isLimited && p.purchasedCount >= p.limitCount)) return false;

        p.purchasedCount++;
        
        for (const r of p.rewards) {
            if (Object.values(CurrencyType).includes(r.type as CurrencyType)) {
                this.earn(r.type as CurrencyType, r.amount, '购买');
            }
        }

        this.totalSpent += p.price;
        if (this.isFirstPurchase) {
            this.isFirstPurchase = false;
            this.earn(CurrencyType.GEMS, 500, '首充奖励');
        }

        this.saveData();
        return true;
    }

    // ==================== 通行证 ====================

    private initSeason(): void {
        const now = Date.now();
        this.currentSeason = {
            seasonId: 1, name: '萌宠初代·觉醒', theme: 'nature',
            startTime: now, endTime: now + 30 * 24 * 3600 * 1000,
            maxLevel: 50, premiumPrice: 680, elitePrice: 1280,
            freeRewards: this.generatePassRewards(50, false),
            premiumRewards: this.generatePassRewards(50, true),
            eliteRewards: this.generatePassRewards(50, true)
        };
    }

    private generatePassRewards(count: number, isPremium: boolean): PassReward[] {
        const rewards: PassReward[] = [];
        for (let i = 1; i <= count; i++) {
            const mult = isPremium ? 3 : 1;
            rewards.push({
                level: i,
                expRequired: 100 * i,
                items: i % 10 === 0
                    ? [{ type: CurrencyType.GEMS, amount: 50 * mult }]
                    : i % 5 === 0
                        ? [{ type: 'ticket', amount: 1 * mult, name: '高级抽卡券' }]
                        : [{ type: CurrencyType.GOLD, amount: 200 * i * mult }]
            });
        }
        return rewards;
    }

    public addPassExp(exp: number): void {
        this.passExp += exp;
        while (this.passLevel < (this.currentSeason?.maxLevel ?? 0)) {
            const next = this.currentSeason!.freeRewards[this.passLevel];
            if (this.passExp >= next.expRequired) {
                this.passLevel++;
            } else break;
        }
    }

    public getSeason(): BattlePassSeason | null { return this.currentSeason; }
    public getPassLevel(): number { return this.passLevel; }
    public getPassExp(): number { return this.passExp; }

    // ==================== 邀请裂变 ====================

    private initReferral(): void {
        this.referralData = {
            code: this.generateCode(),
            invitedCount: 0,
            rewardTier: 0,
            referrals: []
        };
    }

    private generateCode(): string {
        return 'MC' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    public getReferralMilestones(): ReferralMilestone[] {
        return [
            { required: 1, reward: '100钻石', claimed: this.referralData.invitedCount >= 1 },
            { required: 3, reward: 'SSR萌宠x1', claimed: this.referralData.invitedCount >= 3 },
            { required: 5, reward: '限定皮肤', claimed: this.referralData.invitedCount >= 5 },
            { required: 10, reward: 'UR萌宠x1', claimed: this.referralData.invitedCount >= 10 },
            { required: 20, reward: '传说皮肤+5000钻石', claimed: this.referralData.invitedCount >= 20 }
        ];
    }

    public getReferralData(): ReferralData { return this.referralData; }

    // ==================== 分享 ====================

    private initShareTemplates(): void {
        this.shareTemplates = [
            { type: ShareType.VICTORY, title: '战斗胜利!', message: '我在萌宠大作战中获胜了! 来挑战我吧!', imageId: 'victory', coinReward: 50, gemReward: 0 },
            { type: ShareType.SSR_PULL, title: '抽到SSR了!', message: '运气爆棚! 刚抽到了SSR萌宠!', imageId: 'ssr_pull', coinReward: 100, gemReward: 5 },
            { type: ShareType.UR_PULL, title: 'UR降临!', message: '不敢相信! 我抽到了UR神话萌宠!!', imageId: 'ur_pull', coinReward: 500, gemReward: 30 },
            { type: ShareType.PVP_RANK, title: 'PVP段位提升!', message: '我的PVP段位又升级了!', imageId: 'pvp', coinReward: 100, gemReward: 10 },
            { type: ShareType.INVITE, title: '一起来玩萌宠大作战!', message: '用我的邀请码加入，送UR萌宠!', imageId: 'invite', coinReward: 0, gemReward: 50 },
        ];
    }

    public completeShare(type: ShareType): boolean {
        if (this.shareCountToday >= this.SHARE_REWARD_LIMIT) return false;

        const template = this.shareTemplates.find(t => t.type === type);
        if (!template) return false;

        this.shareCountToday++;
        this.earn(CurrencyType.GOLD, template.coinReward, '分享奖励');
        this.earn(CurrencyType.GEMS, template.gemReward, '分享奖励');
        this.shareRewardsToday += template.coinReward;
        return true;
    }

    // ==================== 邮件/公告 ====================

    private initAnnouncements(): void {
        this.announcements = [
            { id: 'ann_1', title: '🎉 萌宠大作战正式上线!', content: '欢迎来到萌宠大作战的世界! 完成新手引导领取UR萌宠!', imageUrl: '', startTime: Date.now() - 86400000, endTime: Date.now() + 7 * 86400000, priority: 10 },
            { id: 'ann_2', title: '⚔️ PvP赛季第1赛季开启', content: '参与PvP对战赢取赛季限定奖励! 最高可获UR萌宠!', imageUrl: '', startTime: Date.now(), endTime: Date.now() + 30 * 86400000, priority: 8 }
        ];

        this.mails = [
            { id: 'mail_welcome', sender: '系统', title: '欢迎来到萌宠大作战!', content: '感谢下载萌宠大作战! 这里有10万金币和100钻石作为见面礼~', rewards: [{ type: CurrencyType.GOLD, amount: 100000 }, { type: CurrencyType.GEMS, amount: 100 }], sentAt: Date.now(), expiresAt: Date.now() + 30 * 86400000, read: false, claimed: false }
        ];
    }

    public getAnnouncements(): GameAnnouncement[] { return this.announcements; }
    public getMails(): GameMail[] { return this.mails; }
    public claimMail(mailId: string): ProductReward[] | null {
        const mail = this.mails.find(m => m.id === mailId);
        if (!mail || mail.claimed || mail.expiresAt < Date.now()) return null;

        mail.claimed = true;
        for (const r of mail.rewards) {
            if (Object.values(CurrencyType).includes(r.type as CurrencyType)) {
                this.earn(r.type as CurrencyType, r.amount, '邮件');
            }
        }
        return mail.rewards;
    }

    // ==================== 每日重置 ====================

    public dailyReset(): void {
        this.shareCountToday = 0;
        this.saveData();
    }

    // ==================== 持久化 ====================

    private loadData(): void {
        try {
            const data = JSON.parse(GameConfig.loadLocal('market_data') || '{}');
            if (data.passLevel) this.passLevel = data.passLevel;
            if (data.passExp) this.passExp = data.passExp;
            if (data.totalSpent) this.totalSpent = data.totalSpent;
            if (data.isFirstPurchase !== undefined) this.isFirstPurchase = data.isFirstPurchase;
            if (data.mails) this.mails = data.mails;
        } catch {}
    }

    private saveData(): void {
        GameConfig.saveLocal('market_data', JSON.stringify({
            passLevel: this.passLevel,
            passExp: this.passExp,
            totalSpent: this.totalSpent,
            isFirstPurchase: this.isFirstPurchase,
            mails: this.mails
        }));
    }

    // ==================== Getter ====================

    public getTotalSpent(): number { return this.totalSpent; }
    public getIsFirstPurchase(): boolean { return this.isFirstPurchase; }
    public getShareCountToday(): number { return this.shareCountToday; }
}
