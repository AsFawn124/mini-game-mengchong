/**
 * GuildManager - 公会/战队系统
 * 支持公会创建、加入、贡献、公会战、公会商店
 */

import { GameConfig } from '../GameConfig';

// 公会等级配置
interface GuildLevelConfig {
    maxMembers: number;
    upgradeCost: number;
    dailyBonus: number;       // 每日奖励金币
    guildWarBonus: number;   // 公会战奖励倍率
    storeDiscount: number;   // 商店折扣 (0-1)
}

// 成员角色
export enum GuildRole {
    LEADER = 'leader',          // 会长
    VICE_LEADER = 'vice',      // 副会长
    ELDER = 'elder',           // 长老
    MEMBER = 'member',         // 成员
    NEWBIE = 'newbie'          // 新人(加入24小时内)
}

// 成员信息
export interface GuildMember {
    userId: string;
    nickname: string;
    avatar: string;
    role: GuildRole;
    contribution: number;      // 个人贡献值
    weeklyContribution: number;
    joinTime: number;
    lastActiveTime: number;
    pvpRating: number;
}

// 公会基本信息
export interface GuildInfo {
    id: string;
    name: string;
    description: string;
    emblem: string;            // 公会徽章ID
    level: number;
    experience: number;
    totalContribution: number;
    weeklyContribution: number;
    members: GuildMember[];
    memberCount: number;
    maxMembers: number;
    rank: number;
    requirements: {
        minLevel: number;
        minRating: number;
        autoJoin: boolean;
    };
    createdAt: number;
}

// 公会战信息
export interface GuildWar {
    id: string;
    attackerGuildId: string;
    attackerGuildName: string;
    defenderGuildId: string;
    defenderGuildName: string;
    startTime: number;
    endTime: number;
    attackerScore: number;
    defenderScore: number;
    attackerParticipants: string[];
    defenderParticipants: string[];
    status: 'preparing' | 'active' | 'finished';
    rewards: GuildWarReward[];
}

interface GuildWarReward {
    rank: number;
    coins: number;
    items: string[];
}

// 公会商店物品
export interface GuildShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;              // 公会币价格
    currencyType: 'contribution' | 'guild_coin';
    stock: number;
    dailyLimit: number;
    purchasedToday: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export class GuildManager {
    private static instance: GuildManager;

    private myGuild: GuildInfo | null = null;
    private guildList: GuildInfo[] = [];
    private guildWarList: GuildWar[] = [];
    private guildShop: GuildShopItem[] = [];
    private myGuildCoins: number = 0;
    private myContribution: number = 0;

    // 等级配置
    private readonly LEVEL_CONFIG: GuildLevelConfig[] = [
        { maxMembers: 20, upgradeCost: 0, dailyBonus: 50, guildWarBonus: 1.0, storeDiscount: 1.0 },
        { maxMembers: 25, upgradeCost: 5000, dailyBonus: 80, guildWarBonus: 1.1, storeDiscount: 0.95 },
        { maxMembers: 30, upgradeCost: 15000, dailyBonus: 120, guildWarBonus: 1.2, storeDiscount: 0.90 },
        { maxMembers: 35, upgradeCost: 30000, dailyBonus: 180, guildWarBonus: 1.3, storeDiscount: 0.85 },
        { maxMembers: 40, upgradeCost: 60000, dailyBonus: 250, guildWarBonus: 1.5, storeDiscount: 0.80 },
        { maxMembers: 45, upgradeCost: 100000, dailyBonus: 350, guildWarBonus: 1.7, storeDiscount: 0.75 },
        { maxMembers: 50, upgradeCost: 150000, dailyBonus: 500, guildWarBonus: 2.0, storeDiscount: 0.70 },
    ];

    private constructor() {
        this.initGuildShop();
        this.loadLocalData();
    }

    public static getInstance(): GuildManager {
        if (!GuildManager.instance) {
            GuildManager.instance = new GuildManager();
        }
        return GuildManager.instance;
    }

    // ==================== 公会创建与管理 ====================

    /**
     * 创建公会
     */
    public createGuild(name: string, description: string, emblem: string = 'default', 
                       minLevel: number = 5, minRating: number = 0, autoJoin: boolean = false): GuildInfo | null {
        if (this.myGuild) {
            console.warn('[公会] 已经加入公会，请先退出');
            return null;
        }

        if (name.length < 2 || name.length > 12) {
            console.warn('[公会] 公会名称长度需在2-12字符之间');
            return null;
        }

        // 检查重名
        if (this.guildList.some(g => g.name === name)) {
            console.warn('[公会] 公会名已存在');
            return null;
        }

        const guild: GuildInfo = {
            id: `guild_${Date.now()}`,
            name,
            description,
            emblem,
            level: 1,
            experience: 0,
            totalContribution: 0,
            weeklyContribution: 0,
            members: [this.createMember(this.getCurrentUserId(), this.getCurrentNickname(), GuildRole.LEADER)],
            memberCount: 1,
            maxMembers: this.LEVEL_CONFIG[0].maxMembers,
            rank: this.guildList.length + 1,
            requirements: { minLevel, minRating, autoJoin },
            createdAt: Date.now()
        };

        this.myGuild = guild;
        this.myContribution = 0;
        this.myGuildCoins = 0;
        this.guildList.push(guild);
        this.saveLocalData();

        console.log(`[公会] 公会「${name}」创建成功!`);
        return guild;
    }

    /**
     * 申请加入公会
     */
    public applyGuild(guildId: string): boolean {
        const guild = this.guildList.find(g => g.id === guildId);
        if (!guild) {
            console.warn('[公会] 公会不存在');
            return false;
        }

        if (this.myGuild) {
            console.warn('[公会] 已经加入公会');
            return false;
        }

        if (guild.members.length >= guild.maxMembers) {
            console.warn('[公会] 公会人数已满');
            return false;
        }

        if (guild.requirements.autoJoin) {
            this.joinGuild(guild);
            return true;
        }

        // 非自动加入的公会需要审批（模拟）
        console.log(`[公会] 已向「${guild.name}」发送入会申请`);
        return false;
    }

    /**
     * 加入公会
     */
    private joinGuild(guild: GuildInfo): void {
        const member = this.createMember(
            this.getCurrentUserId(),
            this.getCurrentNickname(),
            GuildRole.NEWBIE
        );

        guild.members.push(member);
        guild.memberCount = guild.members.length;
        this.myGuild = guild;
        this.myContribution = 0;
        this.myGuildCoins = 0;

        // 24小时后移除新人标记
        setTimeout(() => {
            const mem = guild.members.find(m => m.userId === this.getCurrentUserId());
            if (mem && mem.role === GuildRole.NEWBIE) {
                mem.role = GuildRole.MEMBER;
            }
        }, 24 * 3600 * 1000);

        console.log(`[公会] 成功加入「${guild.name}」!`);
        this.saveLocalData();
    }

    /**
     * 退出公会
     */
    public leaveGuild(): boolean {
        if (!this.myGuild) return false;

        const myRole = this.getMyRole();
        if (myRole === GuildRole.LEADER) {
            console.warn('[公会] 会长需要先转让会长职位才能退出');
            return false;
        }

        this.myGuild.members = this.myGuild.members.filter(
            m => m.userId !== this.getCurrentUserId()
        );
        this.myGuild.memberCount = this.myGuild.members.length;

        console.log(`[公会] 已退出「${this.myGuild.name}」`);
        this.myGuild = null;
        this.myContribution = 0;
        this.myGuildCoins = 0;
        this.saveLocalData();
        return true;
    }

    /**
     * 解散公会
     */
    public disbandGuild(): boolean {
        if (!this.myGuild || this.getMyRole() !== GuildRole.LEADER) return false;

        this.guildList = this.guildList.filter(g => g.id !== this.myGuild!.id);
        console.log(`[公会] 公会「${this.myGuild.name}」已解散`);

        this.myGuild = null;
        this.myContribution = 0;
        this.myGuildCoins = 0;
        this.saveLocalData();
        return true;
    }

    /**
     * 提升成员职位
     */
    public promoteMember(userId: string, newRole: GuildRole): boolean {
        if (!this.myGuild || this.getMyRole() !== GuildRole.LEADER) return false;

        const member = this.myGuild.members.find(m => m.userId === userId);
        if (!member) return false;

        const oldRole = member.role;
        member.role = newRole;

        console.log(`[公会] ${member.nickname}: ${oldRole} → ${newRole}`);
        this.saveLocalData();
        return true;
    }

    /**
     * 踢出成员
     */
    public kickMember(userId: string): boolean {
        if (!this.myGuild) return false;

        const myRole = this.getMyRole();
        if (myRole !== GuildRole.LEADER && myRole !== GuildRole.VICE_LEADER) return false;

        const target = this.myGuild.members.find(m => m.userId === userId);
        if (!target) return false;
        if (target.role === GuildRole.LEADER) return false;

        this.myGuild.members = this.myGuild.members.filter(m => m.userId !== userId);
        this.myGuild.memberCount = this.myGuild.members.length;

        console.log(`[公会] ${target.nickname} 已被移出公会`);
        this.saveLocalData();
        return true;
    }

    // ==================== 贡献系统 ====================

    /**
     * 贡献资源（金币/道具）
     */
    public donate(amount: number, type: 'coins' | 'items' = 'coins'): boolean {
        if (!this.myGuild) return false;

        let contribution = 0;
        if (type === 'coins') {
            contribution = Math.floor(amount / 10); // 10金币=1贡献
        } else {
            contribution = amount; // 道具1:1
        }

        // 更新公会总贡献
        this.myGuild.totalContribution += contribution;
        this.myGuild.weeklyContribution += contribution;
        this.myContribution += contribution;

        // 更新个人贡献
        const member = this.myGuild.members.find(m => m.userId === this.getCurrentUserId());
        if (member) {
            member.contribution += contribution;
            member.weeklyContribution += contribution;
        }

        // 检查是否升级
        this.checkLevelUp();

        // 奖励公会币
        const guildCoinsReward = Math.floor(contribution * 0.5);
        this.myGuildCoins += guildCoinsReward;

        console.log(`[公会] 捐献成功! +${contribution}贡献值, +${guildCoinsReward}公会币`);
        this.saveLocalData();
        return true;
    }

    /**
     * 检查公会升级
     */
    private checkLevelUp(): void {
        if (!this.myGuild) return;

        const currentLevel = this.myGuild.level;
        const expNeeded = this.getExpForLevel(currentLevel + 1);

        if (this.myGuild.totalContribution >= expNeeded && currentLevel < this.LEVEL_CONFIG.length) {
            const nextConfig = this.LEVEL_CONFIG[currentLevel];
            this.myGuild.level++;
            this.myGuild.maxMembers = nextConfig.maxMembers;

            console.log(`[公会] 🎉 公会升级到 Lv.${this.myGuild.level}! 成员上限提升至${nextConfig.maxMembers}`);
        }
    }

    private getExpForLevel(level: number): number {
        return level * level * 1000;
    }

    // ==================== 公会战 ====================

    /**
     * 发起公会战
     */
    public declareGuildWar(targetGuildId: string): boolean {
        if (!this.myGuild) return false;
        if (this.getMyRole() !== GuildRole.LEADER && this.getMyRole() !== GuildRole.VICE_LEADER) {
            console.warn('[公会战] 权限不足');
            return false;
        }

        const target = this.guildList.find(g => g.id === targetGuildId);
        if (!target) return false;

        // 检查是否有进行中的公会战
        const activeWar = this.guildWarList.find(
            w => (w.attackerGuildId === this.myGuild!.id || w.defenderGuildId === this.myGuild!.id) && w.status === 'active'
        );
        if (activeWar) {
            console.warn('[公会战] 已有进行中的公会战');
            return false;
        }

        const war: GuildWar = {
            id: `war_${Date.now()}`,
            attackerGuildId: this.myGuild.id,
            attackerGuildName: this.myGuild.name,
            defenderGuildId: target.id,
            defenderGuildName: target.name,
            startTime: Date.now() + 3600 * 1000, // 1小时后开始
            endTime: Date.now() + 12 * 3600 * 1000, // 12小时结束
            attackerScore: 0,
            defenderScore: 0,
            attackerParticipants: [],
            defenderParticipants: [],
            status: 'preparing',
            rewards: [
                { rank: 1, coins: 5000, items: ['传说公会宝箱'] },
                { rank: 2, coins: 3000, items: ['史诗公会宝箱'] },
                { rank: 3, coins: 1500, items: ['稀有公会宝箱'] }
            ]
        };

        this.guildWarList.push(war);

        console.log(`[公会战] ⚔️ 「${this.myGuild.name}」向「${target.name}」发起公会战! 1小时后开战`);
        return true;
    }

    /**
     * 参与公会战
     */
    public participateInGuildWar(warId: string, contribution: number): boolean {
        if (!this.myGuild) return false;

        const war = this.guildWarList.find(w => w.id === warId);
        if (!war || war.status !== 'active') {
            console.warn('[公会战] 无法参与');
            return false;
        }

        const isAttacker = war.attackerGuildId === this.myGuild.id;
        const participantList = isAttacker ? war.attackerParticipants : war.defenderParticipants;
        const myId = this.getCurrentUserId();

        // 每人只能参与一次
        if (participantList.includes(myId)) {
            console.warn('[公会战] 已参与本次公会战');
            return false;
        }

        participantList.push(myId);

        if (isAttacker) {
            war.attackerScore += contribution;
        } else {
            war.defenderScore += contribution;
        }

        // 奖励个人贡献
        this.donate(contribution);

        console.log(`[公会战] ✅ 已参战! 贡献 +${contribution}`);
        this.saveLocalData();
        return true;
    }

    /**
     * 结算公会战
     */
    public settleGuildWar(warId: string): void {
        const war = this.guildWarList.find(w => w.id === warId);
        if (!war || war.status !== 'active') return;

        war.status = 'finished';
        const attackerWin = war.attackerScore > war.defenderScore;

        console.log(
            `[公会战] ⚔️ 公会战结束! ` +
            `${war.attackerGuildName}(${war.attackerScore}) vs ${war.defenderGuildName}(${war.defenderScore}) ` +
            `${attackerWin ? war.attackerGuildName + ' 获胜!' : war.defenderGuildName + ' 获胜!'}`
        );
        this.saveLocalData();
    }

    // ==================== 公会商店 ====================

    private initGuildShop(): void {
        this.guildShop = [
            { id: 'gacha_ticket', name: '抽卡券', description: '普通抽卡券x1', cost: 50, currencyType: 'guild_coin', stock: -1, dailyLimit: 5, purchasedToday: 0, rarity: 'common' },
            { id: 'premium_ticket', name: '高级抽卡券', description: '必出R以上萌宠', cost: 200, currencyType: 'guild_coin', stock: -1, dailyLimit: 3, purchasedToday: 0, rarity: 'rare' },
            { id: 'exp_potion', name: '经验药水', description: '萌宠经验+500', cost: 30, currencyType: 'guild_coin', stock: -1, dailyLimit: 10, purchasedToday: 0, rarity: 'common' },
            { id: 'evo_stone', name: '进化石', description: '用于萌宠进化', cost: 150, currencyType: 'guild_coin', stock: -1, dailyLimit: 2, purchasedToday: 0, rarity: 'rare' },
            { id: 'skill_book', name: '技能书', description: '随机技能升级', cost: 300, currencyType: 'guild_coin', stock: -1, dailyLimit: 1, purchasedToday: 0, rarity: 'epic' },
            { id: 'ssr_fragment', name: 'SSR碎片', description: 'SSR萌宠碎片x1', cost: 500, currencyType: 'contribution', stock: -1, dailyLimit: 1, purchasedToday: 0, rarity: 'epic' },
            { id: 'emblem_custom', name: '定制徽章', description: '公会专属徽章', cost: 2000, currencyType: 'contribution', stock: 5, dailyLimit: 1, purchasedToday: 0, rarity: 'legendary' },
            { id: 'guild_boost', name: '公会增益', description: '全公会金币+20%持续24h', cost: 1000, currencyType: 'contribution', stock: -1, dailyLimit: 1, purchasedToday: 0, rarity: 'epic' },
        ];
    }

    public purchaseShopItem(itemId: string): boolean {
        if (!this.myGuild) return false;

        const item = this.guildShop.find(i => i.id === itemId);
        if (!item) return false;

        if (item.dailyLimit > 0 && item.purchasedToday >= item.dailyLimit) {
            console.warn('[公会商店] 今日购买次数已达上限');
            return false;
        }

        if (item.stock === 0) {
            console.warn('[公会商店] 库存不足');
            return false;
        }

        const price = Math.floor(
            item.cost *
            (this.LEVEL_CONFIG[this.myGuild.level - 1]?.storeDiscount || 1.0)
        );

        if (item.currencyType === 'guild_coin' && this.myGuildCoins < price) {
            console.warn('[公会商店] 公会币不足');
            return false;
        }

        if (item.currencyType === 'contribution' && this.myContribution < price) {
            console.warn('[公会商店] 贡献不足');
            return false;
        }

        if (item.currencyType === 'guild_coin') {
            this.myGuildCoins -= price;
        } else {
            this.myContribution -= price;
        }

        item.purchasedToday++;
        if (item.stock > 0) item.stock--;

        console.log(`[公会商店] 购买 ${item.name} 成功! 消耗${price}${item.currencyType === 'guild_coin' ? '公会币' : '贡献值'}`);
        this.saveLocalData();
        return true;
    }

    // ==================== 每日重置 ====================

    public dailyReset(): void {
        if (!this.myGuild) return;

        // 重置公会商店每日购买次数
        this.guildShop.forEach(item => {
            item.purchasedToday = 0;
        });

        // 发放每日登录奖励
        const config = this.LEVEL_CONFIG[this.myGuild.level - 1];
        if (config) {
            this.myGuildCoins += Math.floor(config.dailyBonus * 0.3);
            console.log(`[公会] 每日登录奖励: +${Math.floor(config.dailyBonus * 0.3)}公会币`);
        }

        this.saveLocalData();
    }

    // ==================== 每周重置 ====================

    public weeklyReset(): void {
        if (!this.myGuild) return;

        this.myGuild.weeklyContribution = 0;
        this.myGuild.members.forEach(m => {
            m.weeklyContribution = 0;
        });

        console.log('[公会] 每周贡献已重置');
        this.saveLocalData();
    }

    // ==================== 辅助函数 ====================

    private createMember(userId: string, nickname: string, role: GuildRole): GuildMember {
        return {
            userId,
            nickname,
            avatar: '',
            role,
            contribution: 0,
            weeklyContribution: 0,
            joinTime: Date.now(),
            lastActiveTime: Date.now(),
            pvpRating: 1000
        };
    }

    private getMyRole(): GuildRole | null {
        if (!this.myGuild) return null;
        const member = this.myGuild.members.find(m => m.userId === this.getCurrentUserId());
        return member?.role || null;
    }

    private getCurrentUserId(): string {
        // 实际环境从微信SDK获取
        return GameConfig.loadLocal('user_id') || 'local_user';
    }

    private getCurrentNickname(): string {
        return GameConfig.loadLocal('nickname') || '训练师';
    }

    // ==================== 数据持久化 ====================

    private loadLocalData(): void {
        try {
            const data = JSON.parse(GameConfig.loadLocal('guild_data') || '{}');
            if (data.myGuild) this.myGuild = data.myGuild;
            if (data.myGuildCoins) this.myGuildCoins = data.myGuildCoins;
            if (data.myContribution) this.myContribution = data.myContribution;
        } catch (e) {
            console.warn('[公会] 加载本地数据失败');
        }
    }

    private saveLocalData(): void {
        const data = {
            myGuild: this.myGuild,
            myGuildCoins: this.myGuildCoins,
            myContribution: this.myContribution
        };
        GameConfig.saveLocal('guild_data', JSON.stringify(data));
    }

    // ==================== Getter ====================

    public getMyGuild(): GuildInfo | null { return this.myGuild; }
    public getMyGuildCoins(): number { return this.myGuildCoins; }
    public getMyContribution(): number { return this.myContribution; }
    public getGuildList(): GuildInfo[] { return this.guildList; }
    public getGuildWarList(): GuildWar[] { return this.guildWarList; }
    public getGuildShop(): GuildShopItem[] { return this.guildShop; }
    public hasGuild(): boolean { return this.myGuild !== null; }
    public isLeader(): boolean { return this.getMyRole() === GuildRole.LEADER; }
}
